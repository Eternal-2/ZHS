import { create } from 'zustand';
import type { Guide, UMKM, Destination } from '../data/mockData';
import { MOCK_GUIDES, MOCK_UMKM, MOCK_DESTINATIONS, AI_KNOWLEDGE_BASE } from '../data/mockData';
import { callGeminiApi } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import { defaultTourDate } from '../lib/dates';
import { loadCatalog } from '../services/catalogService';
import { fetchCurrentUser, signInWithPassword, signOut, updateProfileRow } from '../services/authService';
import type { PaymentInfo } from '../services/bookingService';
import {
  fetchMyBookings, fetchBookingByDbId, createBooking, createPayment, subscribeBookingStatus,
  cancelBookingRpc, guideConfirmRpc, guideStartTourRpc, completeTourRpc, redeemVoucherRpc,
  requestWithdrawalRpc, fetchWalletBalance, fetchPoints, runSmartMatch,
  fetchChat, sendChat, subscribeChat, fetchGuideDestinations, saveGuideDestinations
} from '../services/bookingService';
import type { DestinationItem, TransportOption, FoodCartItem } from '../data/bookingExtras';
import { AVAILABLE_DESTINATIONS, TRANSPORT_OPTIONS, calculatePerPaxPrice } from '../data/bookingExtras';

export type UserRole = 'wisatawan' | 'pemandu' | 'umkm' | 'admin';
export type ScreenType = 
  | 'welcome' 
  | 'login' 
  | 'register' 
  | 'otp' 
  | 'otp-success' 
  | 'home' 
  | 'explore' 
  | 'detail-tour' 
  | 'detail-destinasi' 
  | 'booking-confirm' 
  | 'payment-qris' 
  | 'payment-success' 
  | 'payment-failed' 
  | 'booking-detail' 
  | 'live-tour' 
  | 'review' 
  | 'voucher' 
  | 'voucher-success' 
  | 'profile' 
  | 'edit-profile' 
  | 'help-center' 
  | 'contact-admin' 
  | 'admin-chat' 
  | 'notifications'
  | 'smart-match'
  | 'guide-dashboard'
  | 'direct-chat'
  // Guide registration & verification flow
  | 'guide-register'
  | 'guide-pending-review'
  | 'guide-verification-status'
  | 'guide-verification-approved'
  | 'guide-fix-documents'
  // Guide operational flow
  | 'guide-booking-request'
  | 'guide-reject-booking'
  | 'guide-start-tour'
  | 'guide-tour-active'
  | 'guide-tour-summary'
  | 'guide-no-show-report'
  | 'guide-dispute';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar: string;
  points: number;
  level: string;
  isVerified: boolean;
  address?: string;
  city?: string;
  country?: string;
  languages?: string[];
  travelPreferences?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
  };
}

export interface BookingState {
  id: string;            // kode booking yang tampil di UI (BK-12345)
  dbId?: string;         // uuid baris di database
  touristName?: string;  // diisi untuk tampilan pemandu
  touristAvatar?: string;
  voucherCode?: string;
  title: string;
  destination: string;
  destinationId?: string;
  destinationImage?: string;
  unitPrice: number;
  guide: Guide | null;
  coGuides?: Guide[];
  guidesCount?: number;
  date: string;
  participants: number;
  totalAmount: number;
  originalAmount: number;
  discountAmount: number;
  paymentMethod: 'QRIS' | 'BCA Virtual Account' | 'GoPay' | 'ShopeePay';
  status: 'draft' | 'pending_payment' | 'escrow_locked' | 'confirmed_by_guide' | 'in_tour' | 'completed' | 'cancelled' | 'disputed' | 'expired';
  checkInQrCode: string;
  meetingPoint: string;
  bundledUMKM?: UMKM | null;
  selectedTransport?: TransportOption | null;
  foodAddOns?: FoodCartItem[];
  includeTransport?: boolean;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  reviewRating?: number;
  reviewComment?: string;
}

export function computeBookingTotals(draft: BookingState): BookingState {
  const p = Math.max(1, draft.participants || 1);
  const baseDest = AVAILABLE_DESTINATIONS.find(d => d.id === draft.destinationId) || AVAILABLE_DESTINATIONS[0];
  const rawBase = baseDest.unitPrice || 35000;
  const { unitPrice: effectiveUnitPrice } = calculatePerPaxPrice(rawBase, p);
  const tourSubtotal = effectiveUnitPrice * p;

  // Recommended guides: 1 guide per 10 people
  const recommendedGuides = Math.max(1, Math.ceil(p / 10));
  const count = draft.guidesCount !== undefined ? draft.guidesCount : recommendedGuides;
  const extraGuides = Math.max(0, count - 1);
  const extraGuidesFee = extraGuides * 150000;

  const transportFee = draft.selectedTransport ? draft.selectedTransport.price : 0;
  const foodSubtotal = (draft.foodAddOns || []).reduce((acc, item) => acc + item.totalPrice, 0);

  const originalAmount = tourSubtotal + extraGuidesFee + transportFee + foodSubtotal;
  const totalAmount = Math.max(0, originalAmount - (draft.discountAmount || 0));

  return {
    ...draft,
    unitPrice: effectiveUnitPrice,
    participants: p,
    guidesCount: count,
    originalAmount,
    totalAmount
  };
}

export interface SmartMatchCriteria {
  interest: string;
  destinationQuery: string;
  date: string;
  budget: number;
  participants: number;
  useGps: boolean;
  manualCity: string;
}

export interface SmartMatchResult {
  guide: Guide;
  matchScore: number;
  scoringBreakdown: {
    ratingScore: number;
    interestScore: number;
    distanceScore: number;
    budgetScore: number;
    historyScore: number;
    responseScore: number;
  };
  recommendedUMKM: UMKM;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'admin';
  text: string;
  timestamp: string;
  intent?: 'rekomendasi' | 'info_wisata' | 'bantuan_booking' | 'bantuan_pemandu' | 'out_of_scope';
  isGemini?: boolean;
  recommendations?: any[];
  ticketId?: string;
}

export interface DirectChatMessage {
  id: string;
  bookingId: string;
  senderRole: 'wisatawan' | 'pemandu';
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
}

export const INITIAL_DIRECT_CHAT_MESSAGES: DirectChatMessage[] = [];

/** Booking kosong sebagai nilai awal. Dibuat ulang setelah katalog database selesai dimuat. */
const makeDefaultBooking = (): BookingState => {
  const dest = AVAILABLE_DESTINATIONS[0];
  const unit = dest?.unitPrice ?? 0;
  return {
    id: 'BK-BARU',
    title: dest?.title ?? '',
    destination: dest?.location ?? '',
    destinationId: dest?.id,
    destinationImage: dest?.image,
    unitPrice: unit,
    guide: MOCK_GUIDES[0] ?? null,
    coGuides: [],
    guidesCount: 1,
    date: defaultTourDate(),
    participants: 3,
    originalAmount: unit * 3,
    discountAmount: 0,
    totalAmount: unit * 3,
    paymentMethod: 'QRIS',
    status: 'draft',
    checkInQrCode: '',
    meetingPoint: dest?.meetingPoints[0]?.name ?? '',
    bundledUMKM: MOCK_UMKM[0] ?? null,
    selectedTransport: TRANSPORT_OPTIONS[0] ?? null,
    foodAddOns: [],
    includeTransport: false,
    notes: '',
    createdAt: ''
  };
};


interface AppState {
  currentUser: User | null;
  activeScreen: ScreenType;
  darkMode: boolean;
  selectedLanguage: string;
  isAiDrawerOpen: boolean;
  isCancelModalOpen: boolean;
  isAiLoading: boolean;
  catalogReady: boolean;
  paymentInfo: PaymentInfo | null;
  bookingBusy: boolean;
  bookingError: string | null;
  chatMessages: ChatMessage[];
  
  // Real booking flow
  activeBooking: BookingState;
  userBookings: BookingState[];
  currentDraftBooking: BookingState | null;

  appliedVoucherCode: string | null;
  pointsBalance: number;

  smartMatchCriteria: SmartMatchCriteria;
  smartMatchResults: SmartMatchResult[];

  // Compatibility fields
  authModalOpen: boolean;
  authInitialTab: 'login' | 'register';
  closeAuthModal: () => void;
  openAuthModal: (tab?: 'login' | 'register') => void;
  devicePreview: 'responsive' | 'mobile' | 'tablet' | 'desktop' | 'tablet-mockup' | 'mobile-mockup';
  setDevicePreview: (mode: any) => void;

  // Actions
  setActiveScreen: (screen: ScreenType) => void;
  setDarkMode: (val: boolean) => void;
  setSelectedLanguage: (lang: string) => void;
  initApp: () => Promise<void>;
  hydrateUser: (opts?: { navigate?: boolean }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => void;
  toggleAiDrawer: (open?: boolean) => void;
  toggleCancelModal: (open?: boolean) => void;
  sendAiMessage: (text: string) => Promise<void>;
  redeemVoucher: (pointsCost: number, voucherCode: string) => Promise<void>;
  
  // Enhanced booking actions
  initDraftBooking: (dest?: DestinationItem | string, guide?: Guide | string) => void;
  setBookingDestination: (dest: DestinationItem) => void;
  setBookingParticipants: (num: number) => void;
  setBookingDate: (date: string) => void;
  setBookingMeetingPoint: (mp: string) => void;
  setBookingGuide: (guide: Guide) => void;
  setBookingGuidesCount: (count: number) => void;
  setBookingTransport: (transport: TransportOption) => void;
  addFoodAddOn: (item: FoodCartItem) => void;
  updateFoodAddOnQty: (cartId: string, delta: number) => void;
  removeFoodAddOn: (cartId: string) => void;
  clearFoodAddOns: () => void;
  applyPointsDiscount: () => void;
  processPaymentSuccess: () => Promise<void>;
  cancelActiveBooking: () => Promise<void>;
  updateUserProfile: (profile: Partial<User>) => void;

  setSmartMatchCriteria: (criteria: Partial<SmartMatchCriteria>) => void;
  executeSmartMatch: () => Promise<void>;
  startBooking: (guide: Guide, destination?: Destination, bundledUMKM?: UMKM) => void;
  confirmPayment: (method: 'QRIS' | 'BCA Virtual Account' | 'GoPay' | 'ShopeePay') => Promise<void>;
  guideConfirmBooking: () => Promise<void>;
  setActiveBookingById: (bookingId: string) => void;
  markTourCompleted: (bookingId?: string) => void;
  completeTourCheckOut: (rating: number, reviewText: string, bookingId?: string) => Promise<void>;
  cancelBookingById: (bookingId?: string) => Promise<void>;

  // Authentication redirection & Direct Chat
  redirectAfterLogin: ScreenType | null;
  setRedirectAfterLogin: (screen: ScreenType | null) => void;
  directChatMessages: DirectChatMessage[];
  activeChatBookingId: string;
  setActiveChatBookingId: (bookingId: string) => void;
  sendDirectChatMessage: (bookingId: string, text: string) => Promise<void>;
  openDirectChat: (bookingId?: string) => Promise<void>;

  // Guide operational flow
  guideAvailability: boolean;
  toggleGuideAvailability: () => Promise<void>;
  guideWithdrawableBalance: number;
  withdrawGuideBalance: () => Promise<void>;
  guideValidateQr: (qrCode: string) => Promise<{ success: boolean; message: string }>;
  guideManagedDestinations: string[];
  setGuideManagedDestinations: (destIds: string[]) => Promise<void>;
}

// ---------- helper realtime ----------
let authListenerBound = false;
let stopPayment: (() => void) | null = null;
let stopChat: (() => void) | null = null;
const stopChatWatcher = () => { stopChat?.(); stopChat = null; };
const stopWatchers = () => { stopPayment?.(); stopPayment = null; stopChatWatcher(); };

const chatContext = (booking: BookingState, me: User) => {
  const myRole: 'wisatawan' | 'pemandu' = me.role === 'pemandu' ? 'pemandu' : 'wisatawan';
  const guide = booking.guide;
  return {
    me: me.id,
    myRole,
    names: { me: me.name, other: myRole === 'pemandu' ? 'Wisatawan' : guide?.name ?? 'Pemandu' },
    avatars: { me: me.avatar, other: myRole === 'pemandu' ? '' : guide?.avatar ?? '' }
  };
};

/** Pantau status booking: begitu webhook pembayaran mengubahnya, layar otomatis pindah ke "berhasil". */
function watchBookingPayment(dbId: string, set: any) {
  stopPayment?.();
  stopPayment = subscribeBookingStatus(dbId, async (status) => {
    if (status === 'pending_payment') return;
    const fresh = await fetchBookingByDbId(dbId);
    if (!fresh) return;
    set((state: AppState) => ({
      activeBooking: state.activeBooking.dbId === dbId ? fresh : state.activeBooking,
      userBookings: state.userBookings.map((b) => (b.dbId === dbId ? fresh : b)),
      activeScreen:
        state.activeScreen === 'payment-qris'
          ? status === 'cancelled' || status === 'expired' ? 'payment-failed' : 'payment-success'
          : state.activeScreen
    }));
    stopPayment?.(); stopPayment = null;
  });
}

export const useAppStore = create<AppState>((set, get) => ({
  // Default di awal belum login (unauthenticated visitor)
  currentUser: null,
  redirectAfterLogin: null,
  setRedirectAfterLogin: (screen) => set({ redirectAfterLogin: screen }),

  // Direct chat between guide and booking customer
  directChatMessages: INITIAL_DIRECT_CHAT_MESSAGES,
  activeChatBookingId: '',
  guideAvailability: true,
  guideWithdrawableBalance: 0,

  activeScreen: 'welcome',
  darkMode: false,
  selectedLanguage: 'Bahasa Indonesia',
  isAiDrawerOpen: false,
  isCancelModalOpen: false,
  isAiLoading: false,
  appliedVoucherCode: null,
  pointsBalance: 0,
  catalogReady: false,
  paymentInfo: null,
  bookingBusy: false,
  bookingError: null,

  // Real booking flow: initialized with sample realistic booking history
  activeBooking: makeDefaultBooking(),
  userBookings: [],
  currentDraftBooking: null,

  // Compatibility stubs for modals & previews
  authModalOpen: false,
  authInitialTab: 'login',
  closeAuthModal: () => {},
  openAuthModal: () => {},
  devicePreview: 'desktop',
  setDevicePreview: () => {},

  smartMatchCriteria: {
    interest: 'Hidden Spot Alam & Mata Air',
    destinationQuery: 'Purwakarta & Sekitarnya',
    date: defaultTourDate(),
    budget: 450000,
    participants: 3,
    useGps: true,
    manualCity: 'Purwakarta'
  },
  smartMatchResults: [],

  chatMessages: [
    {
      id: 'm-welcome',
      sender: 'ai',
      text: 'Halo! Saya Asisten AI Resmi Zam Zam Hidden Spot (didukung Gemini API). Anda bisa menanyakan rekomendasi tur, sejarah & cagar budaya, sistem Escrow Dana Aman Terjaga, atau pertanyaan umum apa saja!',
      timestamp: '10:00 WIB'
    }
  ],

  setActiveScreen: (screen) => set({ activeScreen: screen }),
  setDarkMode: (val) => set({ darkMode: val }),
  setSelectedLanguage: (lang) => set({ selectedLanguage: lang }),
  
  initApp: async () => {
    await loadCatalog();
    set({ catalogReady: true, activeBooking: makeDefaultBooking() });
    await get().hydrateUser();
    if (!authListenerBound) {
      authListenerBound = true;
      supabase.auth.onAuthStateChange((event) => {
        // jangan memanggil supabase secara sinkron di dalam callback ini
        setTimeout(() => {
          if (event === 'SIGNED_IN' && !get().currentUser) void get().hydrateUser({ navigate: true });
          if (event === 'SIGNED_OUT') set({ currentUser: null, userBookings: [], activeScreen: 'welcome' });
        }, 0);
      });
    }
  },

  hydrateUser: async (opts) => {
    const user = await fetchCurrentUser();
    if (!user) return;
    const isGuide = user.role === 'pemandu';
    const [bookings, balance, managed] = await Promise.all([
      fetchMyBookings(user.id, user.role).catch(() => [] as BookingState[]),
      isGuide ? fetchWalletBalance(user.id).catch(() => 0) : Promise.resolve(0),
      isGuide ? fetchGuideDestinations(user.id).catch(() => [] as string[]) : Promise.resolve(null)
    ]);
    const { redirectAfterLogin, activeScreen } = get();
    const onAuthScreen = ['welcome', 'login', 'register'].includes(activeScreen);
    let next: ScreenType = activeScreen;
    if (opts?.navigate || onAuthScreen) {
      next = redirectAfterLogin && !isGuide ? redirectAfterLogin : isGuide ? 'guide-dashboard' : 'home';
    }
    set((state) => ({
      currentUser: user,
      userBookings: bookings,
      activeBooking: state.currentDraftBooking ? state.activeBooking : bookings[0] ?? state.activeBooking,
      pointsBalance: user.points,
      guideWithdrawableBalance: balance,
      guideManagedDestinations: managed ?? state.guideManagedDestinations,
      activeScreen: next,
      redirectAfterLogin: null
    }));
  },

  signIn: async (email, password) => {
    await signInWithPassword(email, password); // melempar error jika email/password salah
    await get().hydrateUser({ navigate: true });
  },

  logout: () => {
    stopWatchers();
    void signOut();
    set({
      currentUser: null, userBookings: [], activeBooking: makeDefaultBooking(), currentDraftBooking: null,
      pointsBalance: 0, guideWithdrawableBalance: 0, directChatMessages: [], paymentInfo: null,
      activeScreen: 'welcome', redirectAfterLogin: null
    });
  },

  toggleAiDrawer: (open) => set((state) => ({ 
    isAiDrawerOpen: open !== undefined ? open : !state.isAiDrawerOpen 
  })),

  toggleCancelModal: (open) => set((state) => ({ 
    isCancelModalOpen: open !== undefined ? open : !state.isCancelModalOpen 
  })),

  sendAiMessage: async (text) => {
    const time = () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    const history = get().chatMessages;
    set((state) => ({
      chatMessages: [...state.chatMessages, { id: `usr-${Date.now()}`, sender: 'user', text, timestamp: time() }],
      isAiLoading: true
    }));
    let reply: string;
    try {
      reply = await callGeminiApi(text, history);
    } catch (err) {
      console.error('Error fetching AI response:', err);
      reply = 'Maaf, asisten AI sedang tidak dapat dihubungi. Silakan coba beberapa saat lagi.';
    }
    set((state) => ({
      chatMessages: [...state.chatMessages, { id: `ai-${Date.now()}`, sender: 'ai', text: reply, timestamp: time(), isGemini: true }],
      isAiLoading: false
    }));
  },

  redeemVoucher: async (_pointsCost, voucherCode) => {
    try {
      await redeemVoucherRpc(voucherCode); // potong poin & catat voucher di server
      const user = get().currentUser;
      const points = user ? await fetchPoints(user.id) : 0;
      set({ pointsBalance: points, appliedVoucherCode: voucherCode, activeScreen: 'voucher-success' });
    } catch (err: any) {
      window.alert(err.message ?? 'Gagal menukar voucher');
    }
  },

  initDraftBooking: (dest?: DestinationItem | string, guide?: Guide | string) => {
    let targetDest: DestinationItem = AVAILABLE_DESTINATIONS[0];
    if (typeof dest === 'object' && dest !== null) {
      targetDest = dest;
    } else if (typeof dest === 'string') {
      const found = AVAILABLE_DESTINATIONS.find(d => 
        d.title.toLowerCase().includes(dest.toLowerCase()) ||
        d.location.toLowerCase().includes(dest.toLowerCase())
      );
      if (found) targetDest = found;
    }

    let targetGuide: Guide = MOCK_GUIDES[0];
    if (guide && typeof guide === 'object') {
      targetGuide = guide;
    } else if (typeof guide === 'string') {
      const foundGuide = MOCK_GUIDES.find(g => 
        g.name.toLowerCase().includes(guide.toLowerCase()) ||
        g.location.toLowerCase().includes(guide.toLowerCase())
      );
      if (foundGuide) targetGuide = foundGuide;
    }

    const initialParticipants = 3;
    const initialGuidesCount = 1;

    const baseDraft: BookingState = {
      id: `BK-${Math.floor(10000 + Math.random() * 90000)}`,
      title: targetDest.title,
      destination: targetDest.location,
      destinationId: targetDest.id,
      destinationImage: targetDest.image,
      unitPrice: targetDest.unitPrice,
      guide: targetGuide,
      coGuides: [],
      guidesCount: initialGuidesCount,
      date: defaultTourDate(),
      participants: initialParticipants,
      originalAmount: targetDest.unitPrice * initialParticipants,
      discountAmount: 0,
      totalAmount: targetDest.unitPrice * initialParticipants,
      paymentMethod: 'QRIS',
      status: 'pending_payment',
      checkInQrCode: `ZHS-QR-${Math.random().toString(36).substring(7).toUpperCase()}`,
      meetingPoint: targetDest.meetingPoints[0]?.name || 'Stasiun Purwakarta',
      bundledUMKM: MOCK_UMKM[0],
      selectedTransport: TRANSPORT_OPTIONS[0],
      foodAddOns: [],
      includeTransport: false,
      notes: '',
      createdAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    const finalizedDraft = computeBookingTotals(baseDraft);
    set({ currentDraftBooking: finalizedDraft, activeBooking: finalizedDraft });
  },

  setBookingDestination: (dest) => {
    set((state) => {
      const draft = state.currentDraftBooking || state.activeBooking || makeDefaultBooking();
      const updated = computeBookingTotals({
        ...draft,
        title: dest.title,
        destination: dest.location,
        destinationId: dest.id,
        destinationImage: dest.image,
        unitPrice: dest.unitPrice,
        meetingPoint: dest.meetingPoints[0]?.name || draft.meetingPoint
      });
      return { currentDraftBooking: updated, activeBooking: updated };
    });
  },

  setBookingParticipants: (num) => {
    set((state) => {
      const draft = state.currentDraftBooking || state.activeBooking || makeDefaultBooking();
      const p = Math.max(1, num);
      const recommendedGuides = Math.ceil(p / 10);
      const updated = computeBookingTotals({
        ...draft,
        participants: p,
        guidesCount: recommendedGuides
      });
      return { currentDraftBooking: updated, activeBooking: updated };
    });
  },

  setBookingDate: (date) => {
    set((state) => {
      const draft = state.currentDraftBooking || state.activeBooking;
      const updated = { ...draft, date };
      return { currentDraftBooking: updated, activeBooking: updated };
    });
  },

  setBookingMeetingPoint: (meetingPoint) => {
    set((state) => {
      const draft = state.currentDraftBooking || state.activeBooking;
      const updated = { ...draft, meetingPoint };
      return { currentDraftBooking: updated, activeBooking: updated };
    });
  },

  setBookingGuide: (guide) => {
    set((state) => {
      const draft = state.currentDraftBooking || state.activeBooking;
      const updated = { ...draft, guide };
      return { currentDraftBooking: updated, activeBooking: updated };
    });
  },

  setBookingGuidesCount: (count) => {
    set((state) => {
      const draft = state.currentDraftBooking || state.activeBooking || makeDefaultBooking();
      const updated = computeBookingTotals({
        ...draft,
        guidesCount: Math.max(1, count)
      });
      return { currentDraftBooking: updated, activeBooking: updated };
    });
  },

  setBookingTransport: (transport) => {
    set((state) => {
      const draft = state.currentDraftBooking || state.activeBooking || makeDefaultBooking();
      const updated = computeBookingTotals({
        ...draft,
        selectedTransport: transport,
        includeTransport: transport.id !== 'none'
      });
      return { currentDraftBooking: updated, activeBooking: updated };
    });
  },

  addFoodAddOn: (item) => {
    set((state) => {
      const draft = state.currentDraftBooking || state.activeBooking || makeDefaultBooking();
      const currentList = draft.foodAddOns || [];
      const existingIdx = currentList.findIndex((i) => i.cartId === item.cartId);
      let newList: FoodCartItem[];
      if (existingIdx >= 0) {
        newList = currentList.map((i, idx) =>
          idx === existingIdx
            ? { ...i, quantity: i.quantity + item.quantity, totalPrice: (i.quantity + item.quantity) * i.unitPrice }
            : i
        );
      } else {
        newList = [...currentList, item];
      }
      const updated = computeBookingTotals({
        ...draft,
        foodAddOns: newList
      });
      return { currentDraftBooking: updated, activeBooking: updated };
    });
  },

  updateFoodAddOnQty: (cartId, delta) => {
    set((state) => {
      const draft = state.currentDraftBooking || state.activeBooking || makeDefaultBooking();
      const currentList = draft.foodAddOns || [];
      const newList = currentList
        .map((item) => {
          if (item.cartId !== cartId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return {
            ...item,
            quantity: newQty,
            totalPrice: newQty * item.unitPrice
          };
        })
        .filter(Boolean) as FoodCartItem[];

      const updated = computeBookingTotals({
        ...draft,
        foodAddOns: newList
      });
      return { currentDraftBooking: updated, activeBooking: updated };
    });
  },

  removeFoodAddOn: (cartId) => {
    set((state) => {
      const draft = state.currentDraftBooking || state.activeBooking || makeDefaultBooking();
      const currentList = draft.foodAddOns || [];
      const newList = currentList.filter((i) => i.cartId !== cartId);
      const updated = computeBookingTotals({
        ...draft,
        foodAddOns: newList
      });
      return { currentDraftBooking: updated, activeBooking: updated };
    });
  },

  clearFoodAddOns: () => {
    set((state) => {
      const draft = state.currentDraftBooking || state.activeBooking || makeDefaultBooking();
      const updated = computeBookingTotals({
        ...draft,
        foodAddOns: []
      });
      return { currentDraftBooking: updated, activeBooking: updated };
    });
  },

  applyPointsDiscount: async () => {
    const draft = get().currentDraftBooking || get().activeBooking;
    try {
      await redeemVoucherRpc('POIN50K'); // tukar 500 poin -> voucher Rp 50.000 (divalidasi server)
      const user = get().currentUser;
      const points = user ? await fetchPoints(user.id) : get().pointsBalance;
      const updated = computeBookingTotals({ ...draft, discountAmount: 50000, voucherCode: 'POIN50K' });
      set({ currentDraftBooking: updated, activeBooking: updated, pointsBalance: points });
    } catch (err: any) {
      window.alert(err.message ?? 'Poin tidak cukup');
    }
  },

  // Dipanggil tombol "Cek Status Pembayaran". Status asli datang dari webhook payment gateway.
  processPaymentSuccess: async () => {
    const current = get().activeBooking;
    if (!current.dbId) return;
    const fresh = await fetchBookingByDbId(current.dbId);
    if (!fresh) return;
    if (fresh.status === 'pending_payment') {
      window.alert('Pembayaran belum kami terima. Selesaikan pembayaran lalu coba lagi.');
      return;
    }
    set((state) => ({
      activeBooking: fresh,
      userBookings: state.userBookings.map((b) => (b.dbId === fresh.dbId ? fresh : b)),
      activeScreen: fresh.status === 'cancelled' || fresh.status === 'expired' ? 'payment-failed' : 'payment-success'
    }));
  },

  cancelActiveBooking: () => get().cancelBookingById(),

  cancelBookingById: async (bookingId) => {
    const target = bookingId
      ? get().userBookings.find((b) => b.id === bookingId)
      : get().activeBooking;
    if (!target?.dbId) { set({ isCancelModalOpen: false }); return; }
    try {
      await cancelBookingRpc(target.dbId);
      const fresh = await fetchBookingByDbId(target.dbId);
      if (fresh) {
        set((state) => ({
          userBookings: state.userBookings.map((b) => (b.dbId === fresh.dbId ? fresh : b)),
          activeBooking: state.activeBooking.dbId === fresh.dbId ? fresh : state.activeBooking,
          isCancelModalOpen: false
        }));
      }
    } catch (err: any) {
      set({ isCancelModalOpen: false });
      window.alert(err.message ?? 'Booking tidak dapat dibatalkan');
    }
  },

  updateUserProfile: (profile) => {
    const user = get().currentUser;
    set((state) => ({ currentUser: state.currentUser ? { ...state.currentUser, ...profile } : null }));
    if (user) void updateProfileRow(user.id, profile).catch((e) => console.error('Gagal menyimpan profil:', e));
  },

  setSmartMatchCriteria: (criteria) => set((state) => ({
    smartMatchCriteria: { ...state.smartMatchCriteria, ...criteria }
  })),

  executeSmartMatch: async () => {
    const { interest, budget } = get().smartMatchCriteria;
    try {
      const rows = await runSmartMatch(interest, budget);
      const results: SmartMatchResult[] = rows
        .map((r, idx) => {
          const guide = MOCK_GUIDES.find((g) => g.id === r.guide_id);
          if (!guide) return null;
          return {
            guide,
            matchScore: r.match_score,
            scoringBreakdown: {
              ratingScore: r.rating_score, interestScore: r.interest_score, distanceScore: r.distance_score,
              budgetScore: r.budget_score, historyScore: r.history_score, responseScore: r.response_score
            },
            recommendedUMKM: MOCK_UMKM[idx % Math.max(1, MOCK_UMKM.length)]
          } as SmartMatchResult;
        })
        .filter(Boolean) as SmartMatchResult[];
      set({ smartMatchResults: results });
    } catch (err) {
      console.error('Smart Match gagal:', err);
      set({ smartMatchResults: [] });
    }
  },

  startBooking: (guide, destination, bundledUMKM = MOCK_UMKM[0]) => {
    // When selecting a guide, the destination is NOT locked and can be changed anytime!
    const targetDest = destination 
      ? (AVAILABLE_DESTINATIONS.find(d => d.id === destination.id) || AVAILABLE_DESTINATIONS[0])
      : AVAILABLE_DESTINATIONS[0];

    const initialBooking: BookingState = {
      id: `BK-${Math.floor(10000 + Math.random() * 90000)}`,
      title: targetDest.title,
      destination: targetDest.location,
      destinationId: targetDest.id,
      destinationImage: targetDest.image,
      unitPrice: targetDest.unitPrice,
      guide,
      coGuides: [],
      guidesCount: 1,
      date: defaultTourDate(),
      participants: 3,
      originalAmount: targetDest.unitPrice * 3,
      discountAmount: 0,
      totalAmount: targetDest.unitPrice * 3,
      paymentMethod: 'QRIS',
      status: 'pending_payment',
      checkInQrCode: `ZHS-QR-BK${Math.floor(1000 + Math.random() * 9000)}`,
      meetingPoint: targetDest.meetingPoints[0]?.name || 'Stasiun Purwakarta',
      bundledUMKM: bundledUMKM || MOCK_UMKM[0],
      selectedTransport: TRANSPORT_OPTIONS[0],
      foodAddOns: [],
      includeTransport: false,
      notes: '',
      createdAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    const finalized = computeBookingTotals(initialBooking);

    // If user is not logged in: mandate login first before booking confirmation!
    const { currentUser } = get();
    if (!currentUser) {
      set({
        currentDraftBooking: finalized,
        activeBooking: finalized,
        redirectAfterLogin: 'booking-confirm',
        activeScreen: 'login'
      });
      return;
    }

    set({
      currentDraftBooking: finalized,
      activeBooking: finalized,
      redirectAfterLogin: null,
      activeScreen: 'booking-confirm'
    });
  },

  confirmPayment: async (method) => {
    const draft = get().currentDraftBooking || get().activeBooking;
    set({ bookingBusy: true, bookingError: null });
    try {
      const created = await createBooking({ ...draft, paymentMethod: method });   // harga dihitung ulang di server
      const payment = await createPayment(created.dbId!, method);                 // tagihan ke payment gateway
      const booking = { ...created, paymentMethod: method };
      set((state) => ({
        bookingBusy: false,
        paymentInfo: payment,
        currentDraftBooking: null,
        activeBooking: booking,
        userBookings: [booking, ...state.userBookings],
        activeScreen: 'payment-qris'
      }));
      watchBookingPayment(created.dbId!, set);
    } catch (err: any) {
      set({ bookingBusy: false, bookingError: err.message });
      window.alert(`Gagal membuat pesanan: ${err.message}`);
    }
  },

  guideConfirmBooking: async () => {
    const target = get().activeBooking;
    if (!target.dbId) return;
    try {
      await guideConfirmRpc(target.dbId);
      const fresh = await fetchBookingByDbId(target.dbId);
      if (fresh) set((state) => ({
        activeBooking: fresh,
        userBookings: state.userBookings.map((b) => (b.dbId === fresh.dbId ? fresh : b))
      }));
    } catch (err: any) {
      window.alert(err.message ?? 'Gagal mengonfirmasi booking');
    }
  },

  setActiveBookingById: (bookingId) => {
    set((state) => {
      const target = state.userBookings.find(b => b.id === bookingId);
      if (target) {
        return { activeBooking: target };
      }
      return {};
    });
  },

  // Hanya navigasi/UI. Status "completed" & pencairan escrow terjadi di server lewat completeTourCheckOut.
  markTourCompleted: (bookingId) => {
    set((state) => {
      const targetId = bookingId || state.activeBooking.id;
      const patch = { completedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) };
      return {
        activeBooking: state.activeBooking.id === targetId ? { ...state.activeBooking, ...patch } : state.activeBooking
      };
    });
  },

  completeTourCheckOut: async (rating, reviewText, bookingId) => {
    const target = bookingId ? get().userBookings.find((b) => b.id === bookingId) : get().activeBooking;
    if (!target?.dbId) return;
    try {
      await completeTourRpc(target.dbId, rating, reviewText); // simpan ulasan, cairkan escrow, tambah poin
      const [fresh, user] = [await fetchBookingByDbId(target.dbId), get().currentUser];
      const points = user ? await fetchPoints(user.id) : get().pointsBalance;
      set((state) => ({
        activeBooking: fresh ?? state.activeBooking,
        userBookings: state.userBookings.map((b) => (b.dbId === target.dbId && fresh ? fresh : b)),
        pointsBalance: points,
        activeScreen: 'review'
      }));
    } catch (err: any) {
      window.alert(err.message ?? 'Gagal menyelesaikan tur');
    }
  },

  openDirectChat: async (bookingId) => {
    const state = get();
    const targetId = bookingId || state.activeBooking?.id || '';
    set({ activeChatBookingId: targetId, activeScreen: 'direct-chat' });
    const booking = state.userBookings.find((b) => b.id === targetId) || state.activeBooking;
    const me = state.currentUser;
    if (!booking?.dbId || !me) return;
    const ctx = chatContext(booking, me);
    try {
      const messages = await fetchChat(booking.dbId, booking.id, ctx);
      set((st) => ({ directChatMessages: [...st.directChatMessages.filter((m) => m.bookingId !== booking.id), ...messages] }));
      stopChatWatcher();
      stopChat = subscribeChat(booking.dbId, booking.id, ctx, (m) =>
        set((st) => (st.directChatMessages.some((x) => x.id === m.id) ? {} : { directChatMessages: [...st.directChatMessages, m] }))
      );
    } catch (err) {
      console.error('Gagal memuat chat:', err);
    }
  },

  setActiveChatBookingId: (bookingId) => set({ activeChatBookingId: bookingId }),

  sendDirectChatMessage: async (bookingId, text) => {
    const { currentUser, userBookings, activeBooking } = get();
    const booking = userBookings.find((b) => b.id === bookingId) || activeBooking;
    if (!currentUser || !booking?.dbId) return;
    try {
      await sendChat(booking.dbId, currentUser.id, text); // pesan muncul lewat subscription realtime
    } catch (err: any) {
      window.alert(err.message ?? 'Pesan gagal terkirim');
    }
  },

  toggleGuideAvailability: async () => {
    const next = !get().guideAvailability;
    const user = get().currentUser;
    set({ guideAvailability: next });
    if (user) {
      const { error } = await supabase.from('guides').update({ is_available: next }).eq('id', user.id);
      if (error) set({ guideAvailability: !next });
    }
  },

  withdrawGuideBalance: async () => {
    const amount = get().guideWithdrawableBalance;
    const user = get().currentUser;
    if (amount <= 0 || !user) return;
    try {
      await requestWithdrawalRpc(amount);
      set({ guideWithdrawableBalance: await fetchWalletBalance(user.id) });
    } catch (err: any) {
      window.alert(err.message ?? 'Penarikan gagal');
    }
  },

  guideValidateQr: async (qrCode) => {
    try {
      const bookingId = await guideStartTourRpc(qrCode.trim());
      const fresh = await fetchBookingByDbId(bookingId);
      if (fresh) set((state) => ({
        activeBooking: fresh,
        userBookings: state.userBookings.some((b) => b.dbId === fresh.dbId)
          ? state.userBookings.map((b) => (b.dbId === fresh.dbId ? fresh : b))
          : [fresh, ...state.userBookings]
      }));
      return { success: true, message: `Berhasil! E-Tiket valid. Status diubah menjadi 'Sedang Berlangsung (In Tour)'.` };
    } catch {
      return { success: false, message: 'Kode tiket QR tidak ditemukan atau tidak aktif di sistem ZHS.' };
    }
  },

  guideManagedDestinations: [],

  setGuideManagedDestinations: async (destIds) => {
    set({ guideManagedDestinations: destIds });
    const user = get().currentUser;
    if (user) await saveGuideDestinations(user.id, destIds).catch((e) => console.error('Gagal menyimpan destinasi:', e));
  }}));
