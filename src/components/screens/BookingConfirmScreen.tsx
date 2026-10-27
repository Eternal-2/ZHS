import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { MOCK_GUIDES } from '../../data/mockData';
import { 
  AVAILABLE_DESTINATIONS, 
  TRANSPORT_OPTIONS, 
  FOOD_ADDON_ITEMS,
  DestinationItem, 
  TransportOption, 
  FoodAddOnItem,
  FoodCartItem,
  calculatePerPaxPrice
} from '../../data/bookingExtras';
import { 
  ArrowLeft, Calendar, MapPin, User, Users, CheckCircle2, 
  ShieldCheck, AlertCircle, Sparkles, X, ChevronRight, Check,
  Utensils, Bus, Plus, Minus, Trash2, Tag, Info, ShoppingBag,
  Compass, Award, Flame, MessageSquare, Car, ThumbsUp
} from 'lucide-react';

export const BookingConfirmScreen: React.FC = () => {
  const { 
    activeBooking, 
    setBookingDestination,
    setBookingParticipants, 
    setBookingGuidesCount,
    setBookingDate, 
    setBookingMeetingPoint, 
    setBookingGuide,
    setBookingTransport,
    addFoodAddOn,
    updateFoodAddOnQty,
    removeFoodAddOn,
    clearFoodAddOns,
    applyPointsDiscount,
    setActiveScreen 
  } = useAppStore();

  // Modals
  const [destinationModalOpen, setDestinationModalOpen] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [transportDetailModal, setTransportDetailModal] = useState<TransportOption | null>(null);
  
  // ShopeeFood Add-on Modal State
  const [activeFoodModalItem, setActiveFoodModalItem] = useState<FoodAddOnItem | null>(null);
  const [modalVariantIdx, setModalVariantIdx] = useState(0);
  const [modalSpicyIdx, setModalSpicyIdx] = useState(0);
  const [modalSelectedSides, setModalSelectedSides] = useState<string[]>([]);
  const [modalQty, setModalQty] = useState(1);
  const [modalNotes, setModalNotes] = useState('');
  const [foodCategoryTab, setFoodCategoryTab] = useState<'Semua' | 'Makanan Utama' | 'Minuman & Segaran' | 'Camilan & Oleh-Oleh'>('Semua');

  const [guideReadyPopup, setGuideReadyPopup] = useState(false);
  const [notes, setNotes] = useState('');
  const [participantInputStr, setParticipantInputStr] = useState<string>('');

  // Guide calculation: 1 guide per 10 people
  const participants = Math.max(1, activeBooking.participants || 1);
  const recommendedGuides = Math.max(1, Math.ceil(participants / 10));
  const currentGuidesCount = activeBooking.guidesCount !== undefined 
    ? activeBooking.guidesCount 
    : recommendedGuides;
  const isGroupLarge = participants > 10;

  // Selected destination info & DYNAMIC PRICING PER PAX
  const currentDestination = AVAILABLE_DESTINATIONS.find(d => d.id === activeBooking.destinationId) 
    || AVAILABLE_DESTINATIONS[0];
  const baseDestPrice = currentDestination.unitPrice || 35000;
  
  // Pricing breakdown per pax depending on number of participants
  const pricingTier = calculatePerPaxPrice(baseDestPrice, participants);
  const unitPrice = pricingTier.unitPrice;
  const tourTicketSubtotal = unitPrice * participants;

  // Extra guides fee
  const extraGuides = Math.max(0, currentGuidesCount - 1);
  const extraGuidesFee = extraGuides * 150000;

  // Selected transport
  const selectedTransport = activeBooking.selectedTransport || TRANSPORT_OPTIONS[0];

  // Food items in cart
  const foodCartList = activeBooking.foodAddOns || [];
  const foodSubtotal = foodCartList.reduce((sum, item) => sum + item.totalPrice, 0);

  // ShopeeFood Modal Open
  const handleOpenFoodModal = (item: FoodAddOnItem) => {
    setActiveFoodModalItem(item);
    setModalVariantIdx(0);
    setModalSpicyIdx(0);
    setModalSelectedSides([]);
    setModalQty(1);
    setModalNotes('');
  };

  // ShopeeFood Modal Confirm Add
  const handleConfirmAddToCart = () => {
    if (!activeFoodModalItem) return;

    const chosenVariant = activeFoodModalItem.variants.options[modalVariantIdx];
    const itemBase = activeFoodModalItem.basePrice + chosenVariant.priceDiff;
    const chosenSides = activeFoodModalItem.sideOptions.filter(s => modalSelectedSides.includes(s.id));
    const sidesPrice = chosenSides.reduce((sum, s) => sum + s.price, 0);
    const itemUnitPrice = itemBase + sidesPrice;
    const itemTotalPrice = itemUnitPrice * modalQty;
    const chosenSpicy = activeFoodModalItem.spicyOptions ? activeFoodModalItem.spicyOptions[modalSpicyIdx] : undefined;

    const cartId = `${activeFoodModalItem.id}-${modalVariantIdx}-${modalSpicyIdx}-${modalSelectedSides.sort().join('-')}-${modalNotes.trim()}`;

    const newCartItem: FoodCartItem = {
      cartId,
      itemId: activeFoodModalItem.id,
      name: activeFoodModalItem.name,
      umkmName: activeFoodModalItem.umkmName,
      selectedVariant: chosenVariant.label,
      variantPriceDiff: chosenVariant.priceDiff,
      selectedSpicy: chosenSpicy,
      selectedSides: chosenSides,
      unitPrice: itemUnitPrice,
      quantity: modalQty,
      notes: modalNotes,
      totalPrice: itemTotalPrice
    };

    addFoodAddOn(newCartItem);
    setActiveFoodModalItem(null);
  };

  const handleSelectGuide = (guide: typeof MOCK_GUIDES[0]) => {
    setBookingGuide(guide);
    setGuideModalOpen(false);
    setGuideReadyPopup(true);
  };

  const handleSelectDestination = (dest: DestinationItem) => {
    setBookingDestination(dest);
    setDestinationModalOpen(false);
  };

  const filteredFoodItems = foodCategoryTab === 'Semua' 
    ? FOOD_ADDON_ITEMS 
    : FOOD_ADDON_ITEMS.filter(f => f.category === foodCategoryTab);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            onClick={() => setActiveScreen('detail-tour')}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#19324d] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>

          <h1 className="text-base sm:text-lg font-black text-[#19324d]">
            Konfirmasi & Rincian Reservasi
          </h1>

          <div className="w-8" />
        </div>
        
        {/* DESKTOP STEPPER HEADER (exact as Figma Page 59 & 60) */}
        <div className="hidden md:flex items-center justify-center gap-12 py-3 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#19324d]">
            <span className="w-6 h-6 rounded-full bg-[#19324d] text-white flex items-center justify-center text-xs">1</span>
            <span>Detail Reservasi & Add-On</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-200" />
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs">2</span>
            <span>Pembayaran Escrow</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-200" />
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs">3</span>
            <span>E-Tiket & Check-In</span>
          </div>
        </div>

        {/* TWO-COLUMN LAYOUT ON DESKTOP, STACK ON MOBILE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: SELECTION & CUSTOMIZATION FORMS */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* NOTIFIKASI FLEKSIBILITAS PEMANDU & WISATA */}
            <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-between text-xs text-sky-900 shadow-2xs">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-600 shrink-0" />
                <span><strong>Trip Fleksibel:</strong> Memilih pemandu tidak mengunci wisata. Anda bebas merubah spot destinasi kapan saja!</span>
              </div>
            </div>

            {/* CARD 1: PILIHAN DESTINASI WISATA (Bisa Dirubah Kapan Saja) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    DESTINASI WISATA TERPILIH
                  </span>
                  <span className="text-xs text-slate-500">
                    Bisa diubah ke spot mana saja yang ingin dikunjungi
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDestinationModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#19324d] hover:bg-[#122438] text-white font-bold text-xs rounded-full shadow-2xs transition-all flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Katalog Wisata</span>
                </button>
              </div>

              {/* Destination Highlight Preview */}
              <div 
                onClick={() => setDestinationModalOpen(true)}
                className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 hover:border-[#19324d] rounded-2xl cursor-pointer transition-all group"
              >
                <img
                  src={currentDestination.image}
                  alt={currentDestination.title}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 group-hover:scale-105 transition-transform shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] bg-white border border-slate-200 text-[#19324d] font-bold px-2 py-0.5 rounded-md">
                      {currentDestination.category}
                    </span>
                    <span className="text-[10px] text-amber-500 font-bold">
                      ★ {currentDestination.rating}
                    </span>
                    {pricingTier.discountPercent > 0 && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md animate-pulse">
                        Diskon Rombongan -{pricingTier.discountPercent}%
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-[#19324d] text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-sky-700">
                    {currentDestination.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {currentDestination.location}
                  </p>
                  
                  {/* Harga Per Orang Dinamis */}
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="text-sm sm:text-base font-black text-sky-700">
                      Rp {unitPrice.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[11px] text-slate-500">/ orang</span>
                    {pricingTier.discountPercent > 0 && (
                      <span className="text-xs text-slate-400 line-through">
                        Rp {baseDestPrice.toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* QUICK DESTINATION SWITCHER (PILIH CEPAT SPOT LAIN DENGAN 1 KLIK) */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Ganti Cepat ke Spot Lain:
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {AVAILABLE_DESTINATIONS.map((dest) => {
                    const isCurrent = currentDestination.id === dest.id;
                    return (
                      <button
                        key={dest.id}
                        type="button"
                        onClick={() => handleSelectDestination(dest)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 flex items-center gap-1.5 ${
                          isCurrent
                            ? 'bg-[#19324d] text-white border-[#19324d] shadow-2xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {isCurrent && <Check className="w-3 h-3 text-amber-400" />}
                        <span>{dest.title.split('&')[0].replace('Trip to ', '').trim()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CARD 2: PILIHAN PEMANDU WISATA */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    PEMANDU WISATA TERVERIFIKASI
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Siap mendampingi tur di spot wisata pilihan Anda
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setGuideModalOpen(true)}
                  className="text-xs font-bold text-[#19324d] underline hover:text-sky-700"
                >
                  Ganti Pemandu
                </button>
              </div>

              <div 
                onClick={() => setGuideModalOpen(true)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 hover:border-[#19324d] rounded-2xl flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={activeBooking.guide?.avatar || MOCK_GUIDES[0].avatar}
                    alt="Guide"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shrink-0 shadow-2xs"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-[#19324d]">
                        {activeBooking.guide?.name || MOCK_GUIDES[0].name}
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-xs text-slate-500">
                      ★ {activeBooking.guide?.rating || 4.9} • {activeBooking.guide?.specialties[0] || 'Cagar Budaya'}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                      ⚡ Respon {activeBooking.guide?.responseRate || 98}% • Berlisensi Resmi BNSP
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-[#19324d] underline block">Ubah</span>
                  <span className="text-[10px] text-slate-400">Pemandu Utama</span>
                </div>
              </div>
            </div>

            {/* CARD 3: JUMLAH PESERTA & HARGA DINAMIS & ATURAN 1 PEMANDU PER 10 ORANG */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    JUMLAH PESERTA TRIP (BEBAS TANPA BATASAN)
                  </label>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-sky-700">
                      Rp {unitPrice.toLocaleString('id-ID')} / orang
                    </span>
                    {pricingTier.discountPercent > 0 && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        Hemat {pricingTier.discountPercent}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Subtotal preview */}
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-semibold">Subtotal Tiket Wisata</span>
                  <span className="text-base font-extrabold text-[#19324d]">
                    Rp {tourTicketSubtotal.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    ({participants} peserta × Rp {unitPrice.toLocaleString('id-ID')})
                  </span>
                </div>
              </div>

              {/* Direct Input & Counter Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setBookingParticipants(Math.max(1, participants - 1))}
                  className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 font-black text-2xl text-slate-800 transition-all active:scale-95 flex items-center justify-center"
                >
                  -
                </button>
                
                {/* Free Direct Numeric Input */}
                <div className="flex-1 relative flex items-center">
                  <input
                    type="number"
                    min={1}
                    value={participantInputStr !== '' ? participantInputStr : participants}
                    onChange={(e) => {
                      setParticipantInputStr(e.target.value);
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 1) {
                        setBookingParticipants(val);
                      }
                    }}
                    onBlur={() => {
                      if (participantInputStr === '' || parseInt(participantInputStr, 10) < 1) {
                        setBookingParticipants(1);
                      }
                      setParticipantInputStr('');
                    }}
                    className="w-full py-2.5 px-4 bg-slate-50 border border-slate-300 rounded-2xl text-center font-black text-xl text-[#19324d] focus:outline-none focus:border-[#19324d]"
                  />
                  <span className="absolute right-4 text-xs font-bold text-slate-400 pointer-events-none">
                    Peserta
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setBookingParticipants(participants + 1)}
                  className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 font-black text-2xl text-slate-800 transition-all active:scale-95 flex items-center justify-center"
                >
                  +
                </button>
              </div>

              {/* Quick Presets (Tambah Cepat Rombongan Bebas) */}
              <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
                <span className="text-slate-400 text-[11px] font-semibold">Tambah cepat:</span>
                {[+5, +10, +25, +50].map((add) => (
                  <button
                    key={add}
                    type="button"
                    onClick={() => setBookingParticipants(participants + add)}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                  >
                    +{add} Orang
                  </button>
                ))}
              </div>

              {/* TIER PRICING INFO CARDS */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1.5">
                <span className="font-bold text-[#19324d] block">
                  💡 Skema Harga Tiket Dinamis Per Orang:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                  <div className={`p-2 rounded-xl border text-center ${participants <= 3 ? 'bg-sky-50 border-[#19324d] font-bold text-[#19324d]' : 'bg-white border-slate-200 text-slate-600'}`}>
                    <span>1 - 3 Orang</span>
                    <strong className="block text-xs mt-0.5">Rp {baseDestPrice.toLocaleString('id-ID')}</strong>
                    <span className="text-[9px] text-slate-400">Tarif Standar</span>
                  </div>
                  <div className={`p-2 rounded-xl border text-center ${participants >= 4 && participants <= 9 ? 'bg-sky-50 border-[#19324d] font-bold text-[#19324d]' : 'bg-white border-slate-200 text-slate-600'}`}>
                    <span>4 - 9 Orang</span>
                    <strong className="block text-xs mt-0.5">Rp {Math.round(baseDestPrice * 0.9).toLocaleString('id-ID')}</strong>
                    <span className="text-[9px] text-emerald-600 font-bold">Hemat 10%</span>
                  </div>
                  <div className={`p-2 rounded-xl border text-center ${participants >= 10 && participants <= 19 ? 'bg-sky-50 border-[#19324d] font-bold text-[#19324d]' : 'bg-white border-slate-200 text-slate-600'}`}>
                    <span>10 - 19 Orang</span>
                    <strong className="block text-xs mt-0.5">Rp {Math.round(baseDestPrice * 0.8).toLocaleString('id-ID')}</strong>
                    <span className="text-[9px] text-emerald-600 font-bold">Hemat 20%</span>
                  </div>
                  <div className={`p-2 rounded-xl border text-center ${participants >= 20 ? 'bg-sky-50 border-[#19324d] font-bold text-[#19324d]' : 'bg-white border-slate-200 text-slate-600'}`}>
                    <span>20+ Orang</span>
                    <strong className="block text-xs mt-0.5">Rp {Math.round(baseDestPrice * 0.7).toLocaleString('id-ID')}</strong>
                    <span className="text-[9px] text-emerald-600 font-bold">Hemat 30%</span>
                  </div>
                </div>
              </div>

              {/* REKOMENDASI 1 PEMANDU PER 10 ORANG */}
              {isGroupLarge && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-start gap-2.5 text-xs text-amber-950 font-bold">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-sm">Rekomendasi Kenyamanan: 1 Pemandu per 10 Orang</span>
                      <p className="text-[11px] font-normal text-amber-900 leading-relaxed">
                        Rombongan Anda berjumlah <strong>{participants} orang</strong>. Standar operasional Zam Zam merekomendasikan <strong>{recommendedGuides} Pemandu</strong> (1 pemandu per 10 orang) agar penjelasan sejarah, pengawalan cagar budaya, dan keselamatan rombongan terjaga prima.
                      </p>
                    </div>
                  </div>

                  {/* Guides count adjuster & auto-apply button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-amber-200 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setBookingGuidesCount(recommendedGuides)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl shadow-2xs text-[11px]"
                      >
                        Terapkan Rekomendasi ({recommendedGuides} Pemandu)
                      </button>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-amber-900 font-semibold text-[11px]">Jumlah Pemandu:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setBookingGuidesCount(Math.max(1, currentGuidesCount - 1))}
                          className="w-7 h-7 rounded-lg bg-white border border-amber-300 font-bold text-slate-800 flex items-center justify-center hover:bg-amber-100"
                        >
                          -
                        </button>
                        <span className="font-extrabold text-[#19324d] px-2.5 py-0.5 bg-white rounded-md border border-amber-300 text-xs">
                          {currentGuidesCount} Pemandu
                        </span>
                        <button
                          type="button"
                          onClick={() => setBookingGuidesCount(currentGuidesCount + 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-amber-300 font-bold text-slate-800 flex items-center justify-center hover:bg-amber-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {extraGuides > 0 && (
                    <div className="text-[11px] text-amber-900 font-medium bg-amber-100/70 p-2.5 rounded-xl flex items-center justify-between">
                      <span>1 Pemandu Utama + {extraGuides} Co-Guide Bersertifikat</span>
                      <span className="font-bold">+Rp {extraGuidesFee.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CARD 4: PILIHAN & DETAIL TRANSPORTASI TRIP */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    PILIHAN & DETAIL TRANSPORTASI TRIP
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Pilih armada sesuai jumlah rombongan dan kebutuhan perjalanan
                  </span>
                </div>
                <span className="text-sm font-extrabold text-[#19324d]">
                  {selectedTransport.price === 0 ? 'Gratis (Mandiri)' : `Rp ${selectedTransport.price.toLocaleString('id-ID')}`}
                </span>
              </div>

              {/* Transportation selection list */}
              <div className="space-y-3">
                {TRANSPORT_OPTIONS.map((trans) => {
                  const isSelected = selectedTransport.id === trans.id;
                  const isRecommendedForGroup = 
                    (participants > 35 && trans.id === 'big-bus') ||
                    (participants > 19 && participants <= 35 && trans.id === 'medium-bus') ||
                    (participants > 12 && participants <= 19 && trans.id === 'elf-long') ||
                    (participants > 4 && participants <= 12 && trans.id === 'hiace') ||
                    (participants >= 2 && participants <= 4 && trans.id === 'avanza') ||
                    (participants === 1 && (trans.id === 'ojek' || trans.id === 'none'));

                  return (
                    <div
                      key={trans.id}
                      onClick={() => setBookingTransport(trans)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-[#19324d] bg-sky-50/50 ring-2 ring-[#19324d]/10'
                          : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-[#19324d] bg-[#19324d]' : 'border-slate-300'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-xs sm:text-sm text-[#19324d]">
                              {trans.name}
                            </h4>
                            {trans.badge && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
                                {trans.badge}
                              </span>
                            )}
                            {isRecommendedForGroup && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold animate-pulse">
                                ★ Rekomendasi {participants} Orang
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {trans.capacityText} • {trans.facilities.slice(0, 2).join(', ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pl-8 sm:pl-0">
                        <span className="font-extrabold text-xs sm:text-sm text-[#19324d]">
                          {trans.price === 0 ? 'Rp 0' : `Rp ${trans.price.toLocaleString('id-ID')}`}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTransportDetailModal(trans);
                          }}
                          className="px-2.5 py-1 text-[11px] bg-white border border-slate-300 hover:border-[#19324d] text-sky-800 font-bold rounded-lg shadow-2xs"
                        >
                          Detail Armada
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CARD 5: ADD-ON KULINER & BUNDLING UMKM (SHOPEEFOOD STYLE) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200 text-[10px] font-bold mb-1">
                    <Utensils className="w-3 h-3 text-orange-600" />
                    <span>ADD-ON KULINER & OLEH-OLEH (SHOPEEFOOD STYLE)</span>
                  </div>
                  <h3 className="text-base font-extrabold text-[#19324d]">
                    Menu Bundling UMKM Lokal Pasundan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pilih variasi daging, porsi, level pedas, dan topping pelengkap. Masuk keranjang sebelum checkout.
                  </p>
                </div>

                {foodCartList.length > 0 && (
                  <div className="px-3 py-1.5 bg-orange-100/80 border border-orange-300 rounded-xl text-orange-950 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
                    <ShoppingBag className="w-4 h-4 text-orange-700" />
                    <span>{foodCartList.length} Menu di Keranjang (Rp {foodSubtotal.toLocaleString('id-ID')})</span>
                  </div>
                )}
              </div>

              {/* Category Filter Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {(['Semua', 'Makanan Utama', 'Minuman & Segaran', 'Camilan & Oleh-Oleh'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFoodCategoryTab(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                      foodCategoryTab === cat
                        ? 'bg-orange-500 text-white border-orange-500 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Food Item Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredFoodItems.map((food) => (
                  <div
                    key={food.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-all gap-3"
                  >
                    <div className="flex gap-3 min-w-0">
                      <img
                        src={food.image}
                        alt={food.name}
                        className="w-20 h-20 rounded-2xl object-cover shrink-0 shadow-2xs"
                      />
                      <div className="min-w-0 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold block truncate">
                            {food.umkmName}
                          </span>
                          <h4 className="font-extrabold text-xs text-[#19324d] line-clamp-1 leading-snug">
                            {food.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                            {food.description}
                          </p>
                        </div>
                        <span className="font-extrabold text-xs text-orange-600 mt-1">
                          Mulai Rp {food.basePrice.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                      <span className="text-[10px] text-slate-500 font-medium">
                        {food.variants.options.length} Pilihan Variasi
                      </span>

                      <button
                        type="button"
                        onClick={() => handleOpenFoodModal(food)}
                        className="px-3 py-1.5 bg-[#19324d] hover:bg-[#122438] text-white font-bold text-xs rounded-xl shadow-2xs active:scale-95 transition-all shrink-0 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Pilih Variasi</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* KERANJANG MAKANAN YANG SUDAH DITAMBAH (SHOPEEFOOD STYLE CART BOX) */}
              {foodCartList.length > 0 && (
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#19324d] flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-orange-600" />
                      <span>Keranjang Makanan & Bundling ({foodCartList.length} Menu)</span>
                    </span>
                    <button
                      type="button"
                      onClick={clearFoodAddOns}
                      className="text-[11px] text-red-600 hover:underline font-semibold"
                    >
                      Kosongkan Keranjang
                    </button>
                  </div>

                  <div className="space-y-2">
                    {foodCartList.map((cartItem) => (
                      <div
                        key={cartItem.cartId}
                        className="p-3.5 bg-orange-50/60 border border-orange-200 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-2xs"
                      >
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <strong className="text-slate-900 block truncate font-extrabold">
                            {cartItem.name}
                          </strong>
                          <span className="text-[11px] text-orange-900 block">
                            • Varian: {cartItem.selectedVariant}
                          </span>
                          {cartItem.selectedSpicy && (
                            <span className="text-[11px] text-red-700 block font-medium">
                              • Level: {cartItem.selectedSpicy}
                            </span>
                          )}
                          {cartItem.selectedSides.length > 0 && (
                            <span className="text-[10px] text-slate-500 block truncate">
                              • Pelengkap: {cartItem.selectedSides.map(s => s.label).join(', ')}
                            </span>
                          )}
                          {cartItem.notes && (
                            <span className="text-[10px] text-slate-500 italic block">
                              Catatan: "{cartItem.notes}"
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-extrabold text-[#19324d]">
                            Rp {cartItem.totalPrice.toLocaleString('id-ID')}
                          </span>

                          <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => updateFoodAddOnQty(cartItem.cartId, -1)}
                              className="w-5 h-5 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded"
                            >
                              -
                            </button>
                            <span className="px-1.5 font-bold text-[11px]">
                              {cartItem.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateFoodAddOnQty(cartItem.cartId, 1)}
                              className="w-5 h-5 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFoodAddOn(cartItem.cartId)}
                            className="text-slate-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CARD 6: TANGGAL & TITIK TEMU */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date trigger */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    TANGGAL KUNJUNGAN
                  </label>
                  <div
                    onClick={() => setDateModalOpen(true)}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl flex items-center justify-between cursor-pointer hover:border-[#19324d] transition-colors"
                  >
                    <span className="text-xs font-semibold text-[#19324d]">
                      {activeBooking.date}
                    </span>
                    <Calendar className="w-4 h-4 text-slate-500" />
                  </div>
                </div>

                {/* Meeting Point trigger */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    MEETING POINT
                  </label>
                  <div
                    onClick={() => setMeetingModalOpen(true)}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl flex items-center justify-between cursor-pointer hover:border-[#19324d] transition-colors"
                  >
                    <span className="text-xs font-semibold text-[#19324d] truncate">
                      {activeBooking.meetingPoint}
                    </span>
                    <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  CATATAN TAMBAHAN (OPSIONAL)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Rombongan membawa lansia / anak kecil, butuh briefing awal..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#19324d]"
                />
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: TRANSPARENT ITEMIZED BILLING & CTA */}
          <div className="lg:col-span-5 space-y-4 sticky top-20">
            
            {/* Promo Poin Card */}
            <div className="p-4 bg-amber-50 border border-dashed border-amber-300 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <div>
                  <span className="text-xs font-bold text-amber-950 block">Promo Poin ZHS</span>
                  <span className="text-[11px] text-amber-700">Gunakan 500 Poin sebagai diskon</span>
                </div>
              </div>
              <button
                type="button"
                onClick={applyPointsDiscount}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow-sm"
              >
                - Rp 50.000
              </button>
            </div>

            {/* Rincian Biaya Card */}
            <div className="p-5 sm:p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-[#19324d] uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Rincian Biaya Transparan</span>
                <span className="text-[10px] text-slate-400 font-normal">Escrow System</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                {/* Tour tickets */}
                <div className="flex justify-between text-slate-600">
                  <span>
                    Tiket Wisata ({participants}x @Rp {unitPrice.toLocaleString('id-ID')})
                  </span>
                  <span className="font-semibold text-slate-900">
                    Rp {tourTicketSubtotal.toLocaleString('id-ID')}
                  </span>
                </div>

                {/* Extra guides fee */}
                {extraGuides > 0 && (
                  <div className="flex justify-between text-amber-800 font-medium">
                    <span>Pemandu Tambahan ({extraGuides} Co-Guide)</span>
                    <span className="font-semibold">
                      Rp {extraGuidesFee.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}

                {/* Transport fee */}
                <div className="flex justify-between text-slate-600">
                  <span className="truncate pr-2">
                    Transportasi: {selectedTransport.name}
                  </span>
                  <span className="font-semibold text-slate-900 shrink-0">
                    {selectedTransport.price === 0 ? 'Rp 0' : `Rp ${selectedTransport.price.toLocaleString('id-ID')}`}
                  </span>
                </div>

                {/* Food Add-on fee */}
                {foodSubtotal > 0 && (
                  <div className="flex justify-between text-orange-700 font-medium">
                    <span>Add-On Kuliner UMKM ({foodCartList.length} menu)</span>
                    <span className="font-semibold">
                      Rp {foodSubtotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}

                {/* Discount */}
                {activeBooking.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Potongan Poin Promo</span>
                    <span>- Rp {activeBooking.discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}

                {/* Total */}
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm font-extrabold text-[#19324d]">
                  <div>
                    <span className="block text-xs text-slate-500 font-normal">Total Pembayaran</span>
                    <span className="text-xl text-[#19324d] font-black">
                      Rp {activeBooking.totalAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    Escrow Locked
                  </span>
                </div>
              </div>

              {/* Dana Aman Terjaga Banner (exact as Figma Page 33 & 59) */}
              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl flex items-start gap-2.5 text-xs text-sky-900">
                <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block">Dana Aman Terjaga (Escrow)</strong>
                  <span className="text-[11px] text-sky-800 leading-snug">
                    Uang Anda ditahan aman di sistem rekening bersama ZHS dan baru dicairkan setelah tur divalidasi selesai di lokasi.
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                onClick={() => setActiveScreen('payment-qris')}
                className="w-full py-3.5 bg-[#19324d] hover:bg-[#122438] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-full shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>LANJUT KE PEMBAYARAN QRIS →</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* MODAL 1: PILIH / GANTI DESTINASI WISATA */}
      {destinationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="font-extrabold text-base text-[#19324d]">Pilih Destinasi Wisata</h3>
                <span className="text-xs text-slate-500">Pemandu akan mendampingi di spot pilihan Anda</span>
              </div>
              <button onClick={() => setDestinationModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 py-3 pr-1">
              {AVAILABLE_DESTINATIONS.map((dest) => (
                <div
                  key={dest.id}
                  onClick={() => handleSelectDestination(dest)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3.5 items-center hover:border-[#19324d] ${
                    currentDestination.id === dest.id
                      ? 'border-[#19324d] bg-sky-50/60 ring-2 ring-[#19324d]/10'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={dest.image}
                    alt={dest.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                      {dest.category}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-[#19324d] mt-1 line-clamp-1">
                      {dest.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">{dest.location}</p>
                    <div className="text-xs font-black text-[#19324d] mt-1">
                      Rp {dest.unitPrice.toLocaleString('id-ID')} <span className="text-[10px] text-slate-400 font-normal">/ orang</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PILIH PEMANDU WISATA */}
      {guideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <h3 className="font-extrabold text-base text-[#19324d]">Pilih Pemandu Wisata</h3>
              <button onClick={() => setGuideModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 py-3 pr-1">
              {MOCK_GUIDES.map((guide) => (
                <div
                  key={guide.id}
                  onClick={() => handleSelectGuide(guide)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3 items-center hover:border-[#19324d] ${
                    activeBooking.guide?.id === guide.id
                      ? 'border-[#19324d] bg-sky-50/60 ring-2 ring-[#19324d]/10'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={guide.avatar}
                    alt={guide.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-300"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <h4 className="font-bold text-sm text-[#19324d] truncate">{guide.name}</h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </div>
                    <span className="text-xs text-amber-500 font-semibold block">
                      ★ {guide.rating} ({guide.reviewsCount} review)
                    </span>
                    <p className="text-[11px] text-slate-500 truncate">{guide.specialties.join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SHOPEEFOOD ADD-ON VARIANT CUSTOMIZER */}
      {activeFoodModalItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <h3 className="font-extrabold text-base text-[#19324d]">Pilih Variasi Menu</h3>
              <button onClick={() => setActiveFoodModalItem(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto space-y-4 py-3 pr-1 text-xs">
              
              {/* Product preview */}
              <div className="flex gap-3 items-center pb-3 border-b border-slate-100">
                <img
                  src={activeFoodModalItem.image}
                  alt={activeFoodModalItem.name}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0"
                />
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    {activeFoodModalItem.umkmName}
                  </span>
                  <h4 className="font-extrabold text-sm text-[#19324d] leading-snug">
                    {activeFoodModalItem.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                    {activeFoodModalItem.description}
                  </p>
                </div>
              </div>

              {/* Group 1: Variants (Radio Style) */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 uppercase tracking-wider block">
                  {activeFoodModalItem.variants.groupName} <span className="text-red-500">*Wajib</span>
                </label>
                <div className="space-y-1.5">
                  {activeFoodModalItem.variants.options.map((opt, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        modalVariantIdx === idx
                          ? 'border-[#19324d] bg-sky-50/50 font-bold ring-1 ring-[#19324d]/10'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="food-variant"
                          checked={modalVariantIdx === idx}
                          onChange={() => setModalVariantIdx(idx)}
                          className="w-4 h-4 text-[#19324d] accent-[#19324d]"
                        />
                        <span className="text-slate-800">{opt.label}</span>
                      </div>
                      <span className="text-slate-600 font-semibold">
                        {opt.priceDiff > 0 ? `+Rp ${opt.priceDiff.toLocaleString('id-ID')}` : opt.priceDiff < 0 ? `-Rp ${Math.abs(opt.priceDiff).toLocaleString('id-ID')}` : 'Rp 0'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Group Spicy Options (Radio Style if available) */}
              {activeFoodModalItem.spicyOptions && activeFoodModalItem.spicyOptions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="font-bold text-slate-800 uppercase tracking-wider block flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-red-500" />
                    <span>Level Pedas / Pilihan Rasa</span>
                    <span className="text-red-500 text-[10px]">*Wajib</span>
                  </label>
                  <div className="space-y-1.5">
                    {activeFoodModalItem.spicyOptions.map((spicy, idx) => (
                      <label
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          modalSpicyIdx === idx
                            ? 'border-orange-500 bg-orange-50/60 font-bold ring-1 ring-orange-500/10'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="food-spicy"
                            checked={modalSpicyIdx === idx}
                            onChange={() => setModalSpicyIdx(idx)}
                            className="w-4 h-4 text-orange-600 accent-orange-600"
                          />
                          <span className="text-slate-800">{spicy}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Group 2: Side Options (Checkbox Style) */}
              {activeFoodModalItem.sideOptions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="font-bold text-slate-800 uppercase tracking-wider block">
                    Pilihan Pelengkap / Menu Tambahan <span className="text-slate-400 font-normal">(Opsional)</span>
                  </label>
                  <div className="space-y-1.5">
                    {activeFoodModalItem.sideOptions.map((side) => {
                      const isChecked = modalSelectedSides.includes(side.id);
                      return (
                        <label
                          key={side.id}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            isChecked
                              ? 'border-[#19324d] bg-sky-50/50 font-semibold ring-1 ring-[#19324d]/10'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setModalSelectedSides([...modalSelectedSides, side.id]);
                                } else {
                                  setModalSelectedSides(modalSelectedSides.filter(id => id !== side.id));
                                }
                              }}
                              className="w-4 h-4 text-[#19324d] accent-[#19324d] rounded"
                            />
                            <span className="text-slate-800">{side.label}</span>
                          </div>
                          <span className="text-slate-600 font-semibold">
                            +Rp {side.price.toLocaleString('id-ID')}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Group 3: Notes */}
              <div className="pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Catatan untuk Dapur / UMKM
                </label>
                <input
                  type="text"
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="Contoh: Sambal dipisah, jangan pakai bawang goreng..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#19324d]"
                />
              </div>

            </div>

            {/* Modal Bottom Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setModalQty(Math.max(1, modalQty - 1))}
                  className="w-7 h-7 flex items-center justify-center font-bold text-base text-slate-700 hover:bg-white rounded-lg"
                >
                  -
                </button>
                <span className="font-black text-sm text-[#19324d] px-2">
                  {modalQty}
                </span>
                <button
                  type="button"
                  onClick={() => setModalQty(modalQty + 1)}
                  className="w-7 h-7 flex items-center justify-center font-bold text-base text-slate-700 hover:bg-white rounded-lg"
                >
                  +
                </button>
              </div>

              {/* Calculated dynamic modal price */}
              {(() => {
                const chosenV = activeFoodModalItem.variants.options[modalVariantIdx];
                const base = activeFoodModalItem.basePrice + chosenV.priceDiff;
                const sides = activeFoodModalItem.sideOptions
                  .filter(s => modalSelectedSides.includes(s.id))
                  .reduce((acc, s) => acc + s.price, 0);
                const total = (base + sides) * modalQty;

                return (
                  <button
                    type="button"
                    onClick={handleConfirmAddToCart}
                    className="flex-1 py-3 bg-[#19324d] hover:bg-[#122438] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Masuk Keranjang</span>
                    <span>• Rp {total.toLocaleString('id-ID')}</span>
                  </button>
                );
              })()}
            </div>

          </div>
        </div>
      )}

      {/* MODAL 4: DETAIL SPESIFIKASI TRANSPORTASI */}
      {transportDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-[#19324d]">
                  Detail Armada Transportasi
                </h3>
                <span className="text-xs text-slate-500">{transportDetailModal.capacityText}</span>
              </div>
              <button onClick={() => setTransportDetailModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <img
              src={transportDetailModal.image}
              alt={transportDetailModal.name}
              className="w-full h-44 rounded-2xl object-cover shadow-xs"
            />

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-extrabold text-sm text-[#19324d]">{transportDetailModal.name}</h4>
                {transportDetailModal.badge && (
                  <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full">
                    {transportDetailModal.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {transportDetailModal.description}
              </p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
              <span className="font-bold text-[#19324d] block">Fasilitas Resmi Termasuk:</span>
              <ul className="grid grid-cols-2 gap-1 text-slate-600">
                {transportDetailModal.facilities.map((fac, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{fac}</span>
                  </li>
                ))}
              </ul>
            </div>

            {transportDetailModal.pickupPoints && transportDetailModal.pickupPoints.length > 0 && (
              <div className="space-y-1 pt-2 border-t border-slate-100 text-xs">
                <span className="font-bold text-[#19324d] block">Titik Antar-Jemput:</span>
                <p className="text-[11px] text-slate-600">
                  {transportDetailModal.pickupPoints.join(' • ')}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Tarif Sewa Trip:</span>
                <span className="text-base font-black text-[#19324d]">
                  {transportDetailModal.price === 0 ? 'Gratis' : `Rp ${transportDetailModal.price.toLocaleString('id-ID')}`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBookingTransport(transportDetailModal);
                  setTransportDetailModal(null);
                }}
                className="px-4 py-2 bg-[#19324d] hover:bg-[#122438] text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Pilih Armada Ini
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: PILIH TANGGAL (Figma Page 34) */}
      {dateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#19324d]">Pilih Tanggal Kunjungan</h3>
              <button onClick={() => setDateModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center font-bold text-sm text-[#19324d]">April 2026</div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
                <span key={d} className="font-bold text-slate-400 py-1">{d}</span>
              ))}
              {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                const dateStr = `${day} April 2026`;
                const isSelected = activeBooking.date === dateStr;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      setBookingDate(dateStr);
                      setDateModalOpen(false);
                    }}
                    className={`py-2 rounded-xl font-bold transition-all ${
                      isSelected
                        ? 'bg-[#19324d] text-white shadow-sm'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: PILIH MEETING POINT */}
      {meetingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#19324d]">Pilih Titik Kumpul</h3>
              <button onClick={() => setMeetingModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {currentDestination.meetingPoints.map((mp) => (
                <div
                  key={mp.id}
                  onClick={() => {
                    setBookingMeetingPoint(mp.name);
                    setMeetingModalOpen(false);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    activeBooking.meetingPoint === mp.name
                      ? 'border-[#19324d] bg-sky-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <strong className="text-xs text-[#19324d] block">{mp.name}</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5">{mp.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* POPUP PEMANDU SIAP (Figma Page 38) */}
      {guideReadyPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <Check className="w-8 h-8" />
            </div>

            <h3 className="font-extrabold text-base text-[#19324d]">
              Pemandu Siap Dampingi Trip Anda!
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pemandu <strong>{activeBooking.guide?.name}</strong> telah mengonfirmasi kesiapan jadwal untuk destinasi <strong>{currentDestination.title}</strong>.
            </p>

            <button
              type="button"
              onClick={() => setGuideReadyPopup(false)}
              className="w-full py-2.5 bg-[#19324d] text-white font-bold text-xs rounded-xl shadow"
            >
              Lanjutkan Reservasi
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
