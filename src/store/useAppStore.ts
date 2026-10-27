import { create } from 'zustand';
import type { Guide, UMKM, Destination } from '../data/mockData';
import { MOCK_GUIDES, MOCK_UMKM, MOCK_DESTINATIONS, AI_KNOWLEDGE_BASE } from '../data/mockData';
import { callGeminiApi, DEFAULT_GEMINI_API_KEY } from '../services/geminiService';
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
  id: string;
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
  status: 'draft' | 'pending_payment' | 'escrow_locked' | 'confirmed_by_guide' | 'in_tour' | 'completed' | 'cancelled';
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

export const INITIAL_DIRECT_CHAT_MESSAGES: DirectChatMessage[] = [
  {
    id: 'dm-1',
    bookingId: 'BK-99201',
    senderRole: 'pemandu',
    senderName: 'Bambang Pamungkas',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    text: 'Halo Kak! Terima kasih telah memesan tur Situ Buleud & Air Mancur Sri Baduga via ZHS. Pembayaran Anda telah terproteksi aman di sistem Escrow ZHS.',
    timestamp: '10:15 WIB'
  },
  {
    id: 'dm-2',
    bookingId: 'BK-99201',
    senderRole: 'wisatawan',
    senderName: 'Niceguymo',
    senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    text: 'Halo Mas Bambang! Senang bisa dipandu Mas Bambang. Untuk meeting point di Plaza Barat, patokannya dekat apa ya Mas?',
    timestamp: '10:18 WIB'
  },
  {
    id: 'dm-3',
    bookingId: 'BK-99201',
    senderRole: 'pemandu',
    senderName: 'Bambang Pamungkas',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    text: 'Patokannya tepat di samping gapura ukiran Sunda dekat pos informasi ZHS. Saya akan mengenakan rompi resmi Pemandu ZHS warna navy dengan badge BNSP.',
    timestamp: '10:20 WIB'
  }
];

const DEFAULT_BOOKING: BookingState = {
  id: 'BK-10245',
  title: AVAILABLE_DESTINATIONS[0].title,
  destination: AVAILABLE_DESTINATIONS[0].location,
  destinationId: AVAILABLE_DESTINATIONS[0].id,
  destinationImage: AVAILABLE_DESTINATIONS[0].image,
  unitPrice: AVAILABLE_DESTINATIONS[0].unitPrice,
  guide: MOCK_GUIDES[0],
  coGuides: [],
  guidesCount: 1,
  date: '1 April 2026',
  participants: 3,
  originalAmount: 105000,
  discountAmount: 0,
  totalAmount: 105000,
  paymentMethod: 'QRIS',
  status: 'pending_payment',
  checkInQrCode: 'ZHS-QR-BK10245',
  meetingPoint: 'Stasiun Purwakarta',
  bundledUMKM: MOCK_UMKM[0],
  selectedTransport: TRANSPORT_OPTIONS[0],
  foodAddOns: [],
  includeTransport: false,
  notes: '',
  createdAt: '1 April 2026'
};

export const INITIAL_BOOKINGS: BookingState[] = [
  {
    id: 'BK-99201',
    title: 'Trip to Situ Buleud & Air Mancur Sri Baduga',
    destination: 'Nagri Kidul, Kec. Purwakarta, Kab. Purwakarta',
    destinationId: 'situ-buleud',
    destinationImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    unitPrice: 35000,
    guide: MOCK_GUIDES[3], // Bambang Pamungkas
    coGuides: [],
    guidesCount: 1,
    date: '12 Oktober 2026',
    participants: 3,
    originalAmount: 105000,
    discountAmount: 0,
    totalAmount: 105000,
    paymentMethod: 'QRIS',
    status: 'confirmed_by_guide',
    checkInQrCode: 'ZHS-QR-BK99201',
    meetingPoint: 'Plaza Air Mancur Gerbang Barat',
    bundledUMKM: MOCK_UMKM[0],
    selectedTransport: TRANSPORT_OPTIONS[0],
    foodAddOns: [
      {
        cartId: 'food-maranggi-init',
        itemId: 'food-maranggi',
        name: 'Sate Maranggi Plered Heritage',
        umkmName: 'Warung Bu Yeti',
        selectedVariant: 'Paket Nasi Timbel',
        variantPriceDiff: 0,
        selectedSpicy: 'Sedang (Iris Cabai Rawit)',
        selectedSides: [],
        unitPrice: 35000,
        quantity: 2,
        notes: '',
        totalPrice: 70000
      }
    ],
    includeTransport: false,
    notes: 'Sediakan payung jika gerimis',
    createdAt: '10 Oktober 2026'
  },
  {
    id: 'BK-88104',
    title: 'Tur Sunrise Savana Gunung Bromo',
    destination: 'Sumberkedawung, Kec. Leces, Kab. Probolinggo',
    destinationId: 'bromo-sunrise',
    destinationImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    unitPrice: 360000,
    guide: MOCK_GUIDES[0], // Ahmad Fauzi
    coGuides: [],
    guidesCount: 1,
    date: '28 September 2026',
    participants: 2,
    originalAmount: 720000,
    discountAmount: 0,
    totalAmount: 720000,
    paymentMethod: 'BCA Virtual Account',
    status: 'completed',
    checkInQrCode: 'ZHS-QR-BK88104',
    meetingPoint: 'Lobby Hotel Bromo Permai',
    bundledUMKM: MOCK_UMKM[1],
    selectedTransport: TRANSPORT_OPTIONS[1],
    foodAddOns: [],
    includeTransport: true,
    notes: 'Bawa jaket tebal',
    createdAt: '25 September 2026',
    completedAt: '28 September 2026, 14:00 WIB',
    reviewRating: 5,
    reviewComment: 'Pengalaman luar biasa melihat sunrise di Bromo bersama Mas Ahmad Fauzi. Penjelasan geologi dan kearifan lokal Tengger sangat berkesan!'
  },
  {
    id: 'BK-76412',
    title: 'Pasir Langlang Panyawangan (Hutan Pinus)',
    destination: 'Desa Cihanjawar, Kec. Bojong/Wanayasa, Purwakarta',
    destinationId: 'pasir-langlang',
    destinationImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    unitPrice: 40500,
    guide: MOCK_GUIDES[1], // Siti Aminah
    coGuides: [],
    guidesCount: 1,
    date: '15 September 2026',
    participants: 4,
    originalAmount: 162000,
    discountAmount: 0,
    totalAmount: 162000,
    paymentMethod: 'GoPay',
    status: 'completed',
    checkInQrCode: 'ZHS-QR-BK76412',
    meetingPoint: 'Pintu Gerbang Wanayasa',
    bundledUMKM: MOCK_UMKM[0],
    selectedTransport: TRANSPORT_OPTIONS[0],
    foodAddOns: [],
    includeTransport: false,
    notes: '',
    createdAt: '12 September 2026',
    completedAt: '15 September 2026, 17:30 WIB',
    reviewRating: 5,
    reviewComment: 'Pemandu sangat ramah, udara sejuk pinus dan teh hangat lokal sangat menyegarkan.'
  }
];

interface AppState {
  currentUser: User | null;
  activeScreen: ScreenType;
  darkMode: boolean;
  selectedLanguage: string;
  isAiDrawerOpen: boolean;
  isCancelModalOpen: boolean;
  isAiLoading: boolean;
  geminiApiKey: string;
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
  setGeminiApiKey: (key: string) => void;
  login: (role: UserRole, email?: string) => void;
  logout: () => void;
  toggleAiDrawer: (open?: boolean) => void;
  toggleCancelModal: (open?: boolean) => void;
  sendAiMessage: (text: string) => Promise<void>;
  redeemVoucher: (pointsCost: number, voucherCode: string) => void;
  
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
  processPaymentSuccess: () => void;
  cancelActiveBooking: () => void;
  updateUserProfile: (profile: Partial<User>) => void;

  setSmartMatchCriteria: (criteria: Partial<SmartMatchCriteria>) => void;
  executeSmartMatch: () => void;
  startBooking: (guide: Guide, destination?: Destination, bundledUMKM?: UMKM) => void;
  confirmPayment: (method: 'QRIS' | 'BCA Virtual Account' | 'GoPay' | 'ShopeePay') => void;
  guideConfirmBooking: () => void;
  setActiveBookingById: (bookingId: string) => void;
  markTourCompleted: (bookingId?: string) => void;
  completeTourCheckOut: (rating: number, reviewText: string, bookingId?: string) => void;
  cancelBookingById: (bookingId: string) => void;

  // Authentication redirection & Direct Chat
  redirectAfterLogin: ScreenType | null;
  setRedirectAfterLogin: (screen: ScreenType | null) => void;
  directChatMessages: DirectChatMessage[];
  activeChatBookingId: string;
  setActiveChatBookingId: (bookingId: string) => void;
  sendDirectChatMessage: (bookingId: string, text: string) => void;
  openDirectChat: (bookingId?: string) => void;

  // Guide operational flow
  guideAvailability: boolean;
  toggleGuideAvailability: () => void;
  guideWithdrawableBalance: number;
  withdrawGuideBalance: () => void;
  guideValidateQr: (qrCode: string) => { success: boolean; message: string };
  guideAcceptLeadBooking: () => void;
  guideManagedDestinations: string[];
  setGuideManagedDestinations: (destIds: string[]) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Default di awal belum login (unauthenticated visitor)
  currentUser: null,
  redirectAfterLogin: null,
  setRedirectAfterLogin: (screen) => set({ redirectAfterLogin: screen }),

  // Direct chat between guide and booking customer
  directChatMessages: INITIAL_DIRECT_CHAT_MESSAGES,
  activeChatBookingId: 'BK-99201',
  guideAvailability: true,
  guideWithdrawableBalance: 4200000,

  activeScreen: 'welcome',
  darkMode: false,
  selectedLanguage: 'Bahasa Indonesia',
  isAiDrawerOpen: false,
  isCancelModalOpen: false,
  isAiLoading: false,
  geminiApiKey: (typeof window !== 'undefined' && localStorage.getItem('zhs_gemini_api_key')) || DEFAULT_GEMINI_API_KEY,
  appliedVoucherCode: null,
  pointsBalance: 2450,

  // Real booking flow: initialized with sample realistic booking history
  activeBooking: INITIAL_BOOKINGS[0],
  userBookings: INITIAL_BOOKINGS,
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
    date: '1 April 2026',
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
  
  setGeminiApiKey: (key) => {
    localStorage.setItem('zhs_gemini_api_key', key);
    set({ geminiApiKey: key });
  },

  login: (role, identifier) => {
    let user: User;
    if (role === 'pemandu') {
      user = {
        id: 'g-4',
        name: identifier && identifier.length > 2 && !identifier.includes('@') ? identifier : 'Bambang Pamungkas',
        username: 'bambang_guide',
        email: identifier && identifier.includes('@') ? identifier : 'bambang.guide@zamzam.com',
        role: 'pemandu',
        phone: '+62 813 9876 5432',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        points: 4800,
        level: 'Master Guide BNSP Level 3',
        isVerified: true,
        city: 'Purwakarta',
        country: 'Indonesia',
        languages: ['Indonesia', 'Sunda', 'English'],
        travelPreferences: ['Cagar Budaya', 'Wisata Air Mancur', 'Heritage Pasundan'],
        emergencyContact: {
          name: 'Himpunan Pramuwisata Indonesia (HPI)',
          phone: '+62 811 9999 8888'
        }
      };
    } else {
      user = {
        id: 'u-1',
        name: identifier && identifier.length > 2 && !identifier.includes('@') ? identifier : 'Niceguymo',
        username: 'niceguymo',
        email: identifier && identifier.includes('@') ? identifier : 'bigmompruy@gmail.com',
        role: 'wisatawan',
        phone: '+62 812 3456 7890',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        points: 2450,
        level: 'Level 5: Heritage Explorer',
        isVerified: true,
        address: 'Jl. Melati No. 45',
        city: 'Jakarta',
        country: 'Indonesia',
        languages: ['Indonesia', 'Inggris'],
        travelPreferences: ['Alam', 'Budaya', 'Petualangan'],
        emergencyContact: {
          name: 'Windah Basudara',
          phone: '+62 811 2222 3333'
        }
      };
    }

    const { redirectAfterLogin } = get();
    if (redirectAfterLogin && role === 'wisatawan') {
      set({
        currentUser: user,
        activeScreen: redirectAfterLogin,
        redirectAfterLogin: null
      });
    } else {
      set({
        currentUser: user,
        activeScreen: role === 'pemandu' ? 'guide-dashboard' : 'home',
        redirectAfterLogin: null
      });
    }
  },

  logout: () => set({ currentUser: null, activeScreen: 'welcome', redirectAfterLogin: null }),

  toggleAiDrawer: (open) => set((state) => ({ 
    isAiDrawerOpen: open !== undefined ? open : !state.isAiDrawerOpen 
  })),

  toggleCancelModal: (open) => set((state) => ({ 
    isCancelModalOpen: open !== undefined ? open : !state.isCancelModalOpen 
  })),

  sendAiMessage: async (text) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    };

    set((state) => ({ 
      chatMessages: [...state.chatMessages, userMsg],
      isAiLoading: true
    }));

    try {
      const history = get().chatMessages;
      const key = get().geminiApiKey;
      const aiResponse = await callGeminiApi(text, history, key);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        isGemini: true
      };

      set((state) => ({ 
        chatMessages: [...state.chatMessages, aiMsg],
        isAiLoading: false
      }));
    } catch (err) {
      console.error('Error fetching AI response:', err);
      set({ isAiLoading: false });
    }
  },

  redeemVoucher: (pointsCost, voucherCode) => {
    set((state) => ({
      pointsBalance: Math.max(0, state.pointsBalance - pointsCost),
      appliedVoucherCode: voucherCode,
      activeScreen: 'voucher-success'
    }));
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
      date: '1 April 2026',
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
      const draft = state.currentDraftBooking || state.activeBooking || DEFAULT_BOOKING;
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
      const draft = state.currentDraftBooking || state.activeBooking || DEFAULT_BOOKING;
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
      const draft = state.currentDraftBooking || state.activeBooking || DEFAULT_BOOKING;
      const updated = computeBookingTotals({
        ...draft,
        guidesCount: Math.max(1, count)
      });
      return { currentDraftBooking: updated, activeBooking: updated };
    });
  },

  setBookingTransport: (transport) => {
    set((state) => {
      const draft = state.currentDraftBooking || state.activeBooking || DEFAULT_BOOKING;
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
      const draft = state.currentDraftBooking || state.activeBooking || DEFAULT_BOOKING;
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
      const draft = state.currentDraftBooking || state.activeBooking || DEFAULT_BOOKING;
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
      const draft = state.currentDraftBooking || state.activeBooking || DEFAULT_BOOKING;
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
      const draft = state.currentDraftBooking || state.activeBooking || DEFAULT_BOOKING;
      const updated = computeBookingTotals({
        ...draft,
        foodAddOns: []
      });
      return { currentDraftBooking: updated, activeBooking: updated };
    });
  },

  applyPointsDiscount: () => {
    set((state) => {
      const draft = state.currentDraftBooking || state.activeBooking;
      const updated = computeBookingTotals({
        ...draft,
        discountAmount: 50000
      });
      return {
        currentDraftBooking: updated,
        activeBooking: updated
      };
    });
  },

  processPaymentSuccess: () => {
    set((state) => {
      const draft = state.currentDraftBooking || state.activeBooking;

      const finalizedBooking: BookingState = {
        ...draft,
        status: 'confirmed_by_guide' // Confirmed in escrow
      };

      return {
        userBookings: [finalizedBooking, ...state.userBookings],
        currentDraftBooking: null,
        activeBooking: finalizedBooking,
        activeScreen: 'payment-success'
      };
    });
  },

  cancelActiveBooking: () => {
    set((state) => {
      const updatedActive = { ...state.activeBooking, status: 'cancelled' as const };
      const updatedList = state.userBookings.map((b) => 
        b.id === state.activeBooking.id ? { ...b, status: 'cancelled' as const } : b
      );
      return {
        userBookings: updatedList,
        activeBooking: updatedActive,
        isCancelModalOpen: false
      };
    });
  },

  cancelBookingById: (bookingId) => {
    set((state) => {
      const updatedList = state.userBookings.map((b) => 
        b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
      );
      const updatedActive = state.activeBooking.id === bookingId
        ? { ...state.activeBooking, status: 'cancelled' as const }
        : state.activeBooking;
      return {
        userBookings: updatedList,
        activeBooking: updatedActive,
        isCancelModalOpen: false
      };
    });
  },

  updateUserProfile: (profile) => {
    set((state) => ({
      currentUser: state.currentUser ? { ...state.currentUser, ...profile } : null
    }));
  },

  setSmartMatchCriteria: (criteria) => set((state) => ({
    smartMatchCriteria: { ...state.smartMatchCriteria, ...criteria }
  })),

  executeSmartMatch: () => {
    const guides = MOCK_GUIDES;
    const results: SmartMatchResult[] = guides.map((guide, idx) => {
      const ratingScore = Math.round((guide.rating / 5.0) * 25);
      const interestScore = 24 - idx * 2;
      const distanceScore = 14;
      const budgetScore = 15;
      const historyScore = Math.min(10, Math.round((guide.completedTours / 200) * 10));
      const responseScore = Math.round((guide.responseRate / 100) * 10);
      const totalScore = ratingScore + interestScore + distanceScore + budgetScore + historyScore + responseScore;
      const recommendedUMKM = MOCK_UMKM[idx % MOCK_UMKM.length];

      return {
        guide,
        matchScore: Math.min(99, totalScore),
        scoringBreakdown: {
          ratingScore,
          interestScore,
          distanceScore,
          budgetScore,
          historyScore,
          responseScore
        },
        recommendedUMKM
      };
    });

    results.sort((a, b) => b.matchScore - a.matchScore);
    set({ smartMatchResults: results });
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
      date: '1 April 2026',
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

  confirmPayment: (method) => {
    set((state) => {
      const draft = state.currentDraftBooking || state.activeBooking;

      const finalizedBooking: BookingState = {
        ...draft,
        paymentMethod: method,
        status: 'confirmed_by_guide'
      };

      return {
        userBookings: [finalizedBooking, ...state.userBookings],
        currentDraftBooking: null,
        activeBooking: finalizedBooking,
        activeScreen: 'payment-success'
      };
    });
  },

  guideConfirmBooking: () => {
    set((state) => {
      const updated = state.userBookings.map((b) => 
        b.id === state.activeBooking.id ? { ...b, status: 'confirmed_by_guide' as const } : b
      );
      return { 
        userBookings: updated,
        activeBooking: { ...state.activeBooking, status: 'confirmed_by_guide' }
      };
    });
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

  markTourCompleted: (bookingId) => {
    set((state) => {
      const targetId = bookingId || state.activeBooking.id;
      const nowStr = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }) + ', ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

      const updated = state.userBookings.map((b) =>
        b.id === targetId ? { ...b, status: 'completed' as const, completedAt: b.completedAt || nowStr } : b
      );
      const updatedActive = state.activeBooking.id === targetId || !bookingId
        ? { ...state.activeBooking, status: 'completed' as const, completedAt: state.activeBooking.completedAt || nowStr }
        : state.activeBooking;

      return {
        userBookings: updated,
        activeBooking: updatedActive
      };
    });
  },

  completeTourCheckOut: (rating, reviewText, bookingId) => {
    set((state) => {
      const targetId = bookingId || state.activeBooking.id;
      const nowStr = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }) + ', ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

      const updated = state.userBookings.map((b) =>
        b.id === targetId
          ? {
              ...b,
              status: 'completed' as const,
              completedAt: b.completedAt || nowStr,
              reviewRating: rating,
              reviewComment: reviewText
            }
          : b
      );
      const updatedActive = state.activeBooking.id === targetId || !bookingId
        ? {
            ...state.activeBooking,
            status: 'completed' as const,
            completedAt: state.activeBooking.completedAt || nowStr,
            reviewRating: rating,
            reviewComment: reviewText
          }
        : state.activeBooking;

      return {
        userBookings: updated,
        activeBooking: updatedActive,
        pointsBalance: state.pointsBalance + 100,
        activeScreen: 'review'
      };
    });
  },

  openDirectChat: (bookingId) => {
    const targetId = bookingId || get().activeBooking?.id || 'BK-99201';
    set({
      activeChatBookingId: targetId,
      activeScreen: 'direct-chat'
    });
  },

  setActiveChatBookingId: (bookingId) => set({ activeChatBookingId: bookingId }),

  sendDirectChatMessage: (bookingId, text) => {
    const { currentUser, directChatMessages } = get();
    const role: 'wisatawan' | 'pemandu' = currentUser?.role === 'pemandu' ? 'pemandu' : 'wisatawan';
    const senderName = currentUser?.name || (role === 'pemandu' ? 'Bambang Pamungkas' : 'Niceguymo');
    const senderAvatar = currentUser?.avatar || (role === 'pemandu' 
      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80');

    const newMsg: DirectChatMessage = {
      id: `dm-${Date.now()}`,
      bookingId,
      senderRole: role,
      senderName,
      senderAvatar,
      text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    };

    set({ directChatMessages: [...directChatMessages, newMsg] });

    // Simulate friendly auto-reply
    setTimeout(() => {
      const state = get();
      if (role === 'wisatawan') {
        const autoReplies = [
          'Baik kak! Informasi diterima. Saya pastikan meeting point sudah siap dan kita bisa mulai tepat waktu.',
          'Siap kak! Semua rincian tur dan tiket cagar budaya sudah saya amankan. Jika ada yang ingin ditanyakan lagi silakan ya!',
          'Terima kasih infonya kak! Saya sudah standby di lokasi titik kumpul ZHS.'
        ];
        const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
        const replyMsg: DirectChatMessage = {
          id: `dm-${Date.now() + 1}`,
          bookingId,
          senderRole: 'pemandu',
          senderName: 'Bambang Pamungkas',
          senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
          text: randomReply,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
        };
        set({ directChatMessages: [...state.directChatMessages, replyMsg] });
      } else {
        const replyMsg: DirectChatMessage = {
          id: `dm-${Date.now() + 1}`,
          bookingId,
          senderRole: 'wisatawan',
          senderName: 'Niceguymo',
          senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          text: 'Terima kasih atas respons cepatnya Mas Bambang! Sampai ketemu di lokasi ya.',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
        };
        set({ directChatMessages: [...state.directChatMessages, replyMsg] });
      }
    }, 1200);
  },

  toggleGuideAvailability: () => set((state) => ({ guideAvailability: !state.guideAvailability })),

  withdrawGuideBalance: () => {
    set((state) => {
      if (state.guideWithdrawableBalance <= 0) return {};
      return { guideWithdrawableBalance: 0 };
    });
  },

  guideValidateQr: (qrCode) => {
    const state = get();
    const cleanCode = qrCode.trim().toUpperCase();
    const found = state.userBookings.find(b => b.checkInQrCode.toUpperCase() === cleanCode);
    if (found) {
      const updated = state.userBookings.map(b => b.id === found.id ? { ...b, status: 'in_tour' as const } : b);
      set({ 
        userBookings: updated, 
        activeBooking: { ...found, status: 'in_tour' } 
      });
      return { success: true, message: `Berhasil! E-Tiket untuk ${found.title} valid. Status diubah menjadi 'Sedang Berlangsung (In Tour)'.` };
    }
    return { success: false, message: 'Kode tiket QR tidak ditemukan atau tidak aktif di sistem ZHS.' };
  },

  guideAcceptLeadBooking: () => {
    const newBooking: BookingState = {
      id: `BK-${Math.floor(10000 + Math.random() * 90000)}`,
      title: 'Tur Lembah Hijau & Mata Air Asri',
      destination: 'Desa Cihanjawar, Kec. Bojong, Purwakarta',
      destinationId: 'pasir-langlang',
      destinationImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
      unitPrice: 40500,
      guide: MOCK_GUIDES[3],
      coGuides: [],
      guidesCount: 1,
      date: '25 Oktober 2026',
      participants: 2,
      originalAmount: 81000,
      discountAmount: 0,
      totalAmount: 81000,
      paymentMethod: 'QRIS',
      status: 'confirmed_by_guide',
      checkInQrCode: `ZHS-QR-BK${Math.floor(1000 + Math.random() * 9000)}`,
      meetingPoint: 'Pos Gerbang Wisata Alam',
      bundledUMKM: MOCK_UMKM[1],
      selectedTransport: TRANSPORT_OPTIONS[0],
      foodAddOns: [],
      includeTransport: false,
      notes: 'Permintaan via Smart Match lead engine',
      createdAt: 'Hari ini'
    };
    set((state) => ({
      userBookings: [newBooking, ...state.userBookings]
    }));
  },

  guideManagedDestinations: (() => {
    try {
      const saved = localStorage.getItem('zhs_guide_destinations');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return ['situ-buleud', 'pasir-langlang', 'curug-tilu', 'gracia-spa'];
  })(),

  setGuideManagedDestinations: (destIds) => {
    try {
      localStorage.setItem('zhs_guide_destinations', JSON.stringify(destIds));
    } catch (e) {}
    set({ guideManagedDestinations: destIds });
  }
}));
