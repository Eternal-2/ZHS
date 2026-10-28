export interface Guide {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  specialties: string[];
  languages: string[];
  pricePerDay: number;
  location: string;
  responseRate: number; // percentage
  completedTours: number;
  bio: string;
  certifications: string[];
  badgeVerified: boolean;
}

export interface UMKM {
  id: string;
  name: string;
  category: 'Kuliner' | 'Kerajinan' | 'Oleh-oleh' | 'Edukasi Budaya';
  owner: string;
  location: string;
  rating: number;
  verified: boolean;
  featuredProduct: string;
  storytelling: string;
  discountVoucher?: string;
  bundlingAvailable: boolean;
  image: string;
}

export interface Destination {
  id: string;
  title: string;
  subtitle: string;
  category: 'Hidden Gems' | 'Wisata Alam' | 'Budaya & Sejarah' | 'Kuliner Lokal';
  location: string;
  image: string;
  rating: number;
  reviews: number;
  estimatedBudget: number;
  description: string;
  highlights: string[];
}

export const MOCK_GUIDES: Guide[] = [
  {
    id: 'g-1',
    name: 'Ahmad Fauzi, S.Par',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    rating: 4.95,
    reviewsCount: 142,
    verified: true,
    badgeVerified: true,
    specialties: ['Sejarah & Heritage', 'Hidden Spot Alam', 'Fotografi Wisata'],
    languages: ['Indonesia', 'English', 'Arabic'],
    pricePerDay: 350000,
    location: 'Banyuwangi & Sekitarnya',
    responseRate: 98,
    completedTours: 184,
    bio: 'Pemandu lokal bersertifikat BNSP dengan pengalaman 6+ tahun menyingkap spot tersembunyi yang belum terjamah turis umum.',
    certifications: ['Pemandu Wisata Madya BNSP', 'Wilderness First Aid', 'ZHS Certified Guide']
  },
  {
    id: 'g-2',
    name: 'Siti Rahmawati',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    rating: 4.88,
    reviewsCount: 96,
    verified: true,
    badgeVerified: true,
    specialties: ['Wisata Kuliner Tradisional', 'Edukasi UMKM & Kriya', 'Family Tour'],
    languages: ['Indonesia', 'Jawa'],
    pricePerDay: 300000,
    location: 'Yogyakarta & Bantul',
    responseRate: 95,
    completedTours: 112,
    bio: 'Menghubungkan wisatawan langsung dengan maestro perajin lokal dan dapur autentik warisan leluhur.',
    certifications: ['Himpunan Pramuwisata Indonesia (HPI)', 'Hospitality Excellence']
  },
  {
    id: 'g-3',
    name: 'Budi Santoso',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    rating: 4.92,
    reviewsCount: 128,
    verified: true,
    badgeVerified: true,
    specialties: ['Trekking & Geowisata', 'Camping & Sunrise Spot', 'Eco-Tourism'],
    languages: ['Indonesia', 'English'],
    pricePerDay: 400000,
    location: 'Lombok Timur & Rinjani Foothill',
    responseRate: 100,
    completedTours: 160,
    bio: 'Pencinta alam sejati yang menguasai jalur rahasia air terjun dan savana tersembunyi dengan keamanan terstandar.',
    certifications: ['Pemandu Ekowisata BNSP', 'Mountaineering Safety Level 2']
  }
];

export const MOCK_UMKM: UMKM[] = [
  {
    id: 'u-1',
    name: 'Dapoer Kopi Warisan Bu Minah',
    category: 'Kuliner',
    owner: 'Ibu Aminah',
    location: 'Desa Kemiren, Banyuwangi',
    rating: 4.9,
    verified: true,
    featuredProduct: 'Kopi Sangrai Tradisional Osing & Kucur Gula Aren',
    storytelling: 'Kopi diproses manual menggunakan wajan tanah liat dengan resep 3 generasi suku Osing.',
    discountVoucher: 'ZHSKOPI15',
    bundlingAvailable: true,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'u-2',
    name: 'Batik Tulis Pewarna Alami Sekar Wangi',
    category: 'Kerajinan',
    owner: 'Pak Sukirno',
    location: 'Imogiri, Bantul',
    rating: 4.85,
    verified: true,
    featuredProduct: 'Kain Selendang Indigofera & Daun Mangga',
    storytelling: '100% pewarna nabati ramah lingkungan dengan motif sakral filosofi keraton.',
    discountVoucher: 'ZHSBATIK20',
    bundlingAvailable: true,
    image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'u-3',
    name: 'Madu Hutan Liar Lestari',
    category: 'Oleh-oleh',
    owner: 'Komunitas Petani Madu Hutan',
    location: 'Sembalun, Lombok',
    rating: 4.92,
    verified: true,
    featuredProduct: 'Madu Dorsata Murni Panen Lestari',
    storytelling: 'Dipanen berkelanjutan tanpa merusak sarang lebah raksasa Apis dorsata.',
    discountVoucher: 'ZHSMADU10',
    bundlingAvailable: true,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=500&q=80'
  }
];

export const MOCK_DESTINATIONS: Destination[] = [
  {
    id: 'd-1',
    title: 'Lembah Hijau & Mata Air Zamzam Asri',
    subtitle: 'Mata air alami jernih di ceruk tebing rahasia',
    category: 'Hidden Gems',
    location: 'Kawasan Lereng Gunung, Sumber Asri',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    rating: 4.96,
    reviews: 84,
    estimatedBudget: 250000,
    description: 'Spot alami dengan air sejuk sebening kristal yang tersembunyi di balik perbukitan hijau, dilengkapi akses jalan setapak berpemandu.',
    highlights: ['Air Sebening Kaca', 'Bebas Kerumunan', 'Kemitraan UMKM Minuman Herbal']
  },
  {
    id: 'd-2',
    title: 'Hutan Pinus Kabut & Sunset Savana',
    subtitle: 'Panorama magis matahari terbenam di atas awan',
    category: 'Wisata Alam',
    location: 'Perbukitan Menoreh, Kulon Progo',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    rating: 4.88,
    reviews: 130,
    estimatedBudget: 320000,
    description: 'Pemandangan lanskap alam eksotis dengan udara sejuk pegunungan, cocok untuk relaksasi dan fotografi estetik.',
    highlights: ['Spot Foto Golden Hour', 'Jalur Trekking Teduh', 'Warung Kopi Seduh Manual']
  },
  {
    id: 'd-3',
    title: 'Desa Adat & Sentra Keramik Tanah Kuno',
    subtitle: 'Melihat langsung peradaban kerajinan tanah liat purba',
    category: 'Budaya & Sejarah',
    location: 'Kasongan Heritage Village',
    image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
    rating: 4.82,
    reviews: 77,
    estimatedBudget: 180000,
    description: 'Belajar teknik membentuk gerabah warisan ratusan tahun langsung dari empu perajin desa bersama pemandu budaya.',
    highlights: ['Workshop Interaktif', 'MOU Kemitraan UMKM Aktif', 'Kisah Budaya Otentik']
  }
];

export const AI_KNOWLEDGE_BASE = [
  {
    topic: 'escrow',
    title: 'Dana Aman Terjaga (Sistem Rekening Bersama Escrow)',
    content: 'Dana pembayaran booking disimpan aman di sistem escrow ZHS dan TIDAK langsung dicairkan ke pemandu. Dana baru dicairkan setelah tur selesai dan wisatawan menekan konfirmasi Check-Out. Jika pemandu tidak konfirmasi dalam 24 jam, sistem otomatis menawarkan Next-Best Match atau refund 100%.'
  },
  {
    topic: 'smart_match',
    title: 'Smart Match Demand & Supply Matching Engine',
    content: 'Algoritma pencocokan berbobot v2.0 menghitung skor kecocokan berdasarkan 6 faktor: Rating & Ulasan Pemandu (25%), Kecocokan Minat Wisata (25%), Jarak GPS (15%), Kesesuaian Budget (15%), Riwayat Tur Selesai (10%), serta Response Rate Pemandu (10%). Hanya pemandu dengan status Terverifikasi yang masuk pool.'
  },
  {
    topic: 'verifikasi',
    title: 'Verifikasi Pemandu & Kemitraan UMKM',
    content: 'Pemandu wajib mengunggah CV, Sertifikat Kompetensi BNSP/HPI, dan portofolio untuk diverifikasi Tim Admin ZHS sebelum mendapatkan Badge Terverifikasi. Mitra UMKM menandatangani MOU Digital dan diintegrasikan ke itinerary bundling dengan storytelling budaya.'
  },
  {
    topic: 'refund',
    title: 'Kebijakan Refund & Pembatalan',
    content: 'Pembatalan H-3 atau lebih: Pengembalian dana 100%. Pembatalan H-1: Pengembalian dana 50%. Pembatalan H-0: Tidak ada pengembalian dana, atau eskalasi ke Tim Bantuan ZHS jika keadaan darurat.'
  }
];
