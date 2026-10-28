export interface DestinationItem {
  id: string;          // slug (dipakai UI)
  dbId?: string;       // uuid di database
  title: string;
  location: string;
  unitPrice: number;
  rating: string;
  category: string;
  image: string;
  description: string;
  meetingPoints: { id: string; name: string; desc: string }[];
  highlights?: string[];
  reviewsCount?: number;
}

export function calculatePerPaxPrice(basePrice: number, participants: number): {
  unitPrice: number;
  originalUnitPrice: number;
  discountPercent: number;
  tierName: string;
} {
  const p = Math.max(1, participants);
  let discountPercent = 0;
  let tierName = 'Tarif Reguler (1-3 Pax)';

  if (p >= 20) {
    discountPercent = 30; // Hemat 30% untuk rombongan 20+ orang
    tierName = 'Grup Super Rombongan (20+ Pax, Diskon 30%)';
  } else if (p >= 10) {
    discountPercent = 20; // Hemat 20% untuk rombongan 10-19 orang
    tierName = 'Paket Rombongan Besar (10-19 Pax, Diskon 20%)';
  } else if (p >= 4) {
    discountPercent = 10; // Hemat 10% untuk grup 4-9 orang
    tierName = 'Grup Sedang / Keluarga (4-9 Pax, Diskon 10%)';
  }

  const unitPrice = Math.round(basePrice * (1 - discountPercent / 100));
  return {
    unitPrice,
    originalUnitPrice: basePrice,
    discountPercent,
    tierName
  };
}

export interface TransportOption {
  id: string;          // slug (dipakai UI)
  dbId?: string;       // uuid di database
  name: string;
  capacityText: string;
  minCapacity: number;
  maxCapacity: number;
  price: number;
  description: string;
  facilities: string[];
  image: string;
  badge?: string;
  pickupPoints?: string[];
}

export interface FoodVariantOption {
  label: string;
  priceDiff: number;
}

export interface FoodSideOption {
  id: string;
  label: string;
  price: number;
}

export interface FoodAddOnItem {
  id: string;
  umkmName: string;
  name: string;
  basePrice: number;
  description: string;
  image: string;
  category: 'Makanan Utama' | 'Minuman & Segaran' | 'Camilan & Oleh-Oleh';
  variants: {
    groupName: string;
    options: FoodVariantOption[];
  };
  spicyOptions?: string[];
  sideOptions: FoodSideOption[];
}

export interface FoodCartItem {
  cartId: string;
  itemId: string;
  name: string;
  umkmName: string;
  selectedVariant: string;
  variantPriceDiff: number;
  selectedSpicy?: string;
  selectedSides: FoodSideOption[];
  unitPrice: number;
  quantity: number;
  notes: string;
  totalPrice: number;
}

export const AVAILABLE_DESTINATIONS: DestinationItem[] = [
  {
    id: 'situ-buleud',
    title: 'Trip to Situ Buleud & Air Mancur Sri Baduga',
    location: 'Nagri Kidul, Kec. Purwakarta, Kab. Purwakarta',
    unitPrice: 35000,
    rating: '9.4/10',
    category: 'Cagar Budaya Sunda',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    description: 'Danau cagar budaya seluas 4 hektar era kolonial dengan atraksi air mancur menari berlaser terbesar dan sentra kuliner Sate Maranggi.',
    meetingPoints: [
      { id: 'stasiun', name: 'Stasiun Purwakarta', desc: 'Pintu keluar barat dekat patung cagar budaya.' },
      { id: 'alun-alun', name: 'Alun-Alun Purwakarta', desc: 'Depan gapura cagar budaya masjid agung.' },
      { id: 'plaza-sri-baduga', name: 'Plaza Air Mancur Sri Baduga', desc: 'Pintu gerbang utama danau Situ Buleud.' }
    ]
  },
  {
    id: 'gracia-spa',
    title: 'Gracia Spa Hot Spring Pool',
    location: 'Desa Cikondang, Kec. Ciater, Kabupaten Subang',
    unitPrice: 100000,
    rating: '9.2/10',
    category: 'Air Panas & Curug',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    description: 'Pemandian air panas alami belerang di tengah hamparan kebun teh Ciater dengan udara pegunungan yang sangat sejuk.',
    meetingPoints: [
      { id: 'gerbang-ciater', name: 'Gerbang Utama Gracia Spa Ciater', desc: 'Lobi penerimaan tamu dan parkir wisata.' },
      { id: 'kebun-teh', name: 'Plaza Kebun Teh Ciater Subang', desc: 'Depan tugu teh hijau Ciater.' }
    ]
  },
  {
    id: 'pasir-langlang',
    title: 'Pasir Langlang Panyawangan (Hutan Pinus Ujung Aspal)',
    location: 'Desa Cihanjawar, Kec. Bojong/Wanayasa, Purwakarta',
    unitPrice: 45000,
    rating: '9.5/10',
    category: 'Wisata Alam & Pinus',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    description: 'Hutan pinus asri di kaki Gunung Burangrang dengan jalur trekking datar, spot hammock santai, dan udara bebas polusi.',
    meetingPoints: [
      { id: 'pos-wanayasa', name: 'Pos Retribusi Pasir Langlang Ujung Aspal', desc: 'Area loket masuk dan pos pemandu lokal.' },
      { id: 'pasar-wanayasa', name: 'Pasar Tradisional Wanayasa', desc: 'Pusat oleh-oleh manisan dan sate maranggi.' }
    ]
  },
  {
    id: 'curug-tilu',
    title: 'Curug Tilu & Kolam Alami Ciririp',
    location: 'Desa Ciririp, Kec. Sukasari, Kab. Purwakarta',
    unitPrice: 40000,
    rating: '9.1/10',
    category: 'Air Panas & Curug',
    image: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&w=800&q=80',
    description: 'Green Canyon mini Purwakarta dengan air toska jernih alami berundak tiga, tebing eksotis, dan persewaan pelampung.',
    meetingPoints: [
      { id: 'dermaga-sukasari', name: 'Dermaga Sukasari Purwakarta', desc: 'Titik temu kapal dan pos pemandu Curug Tilu.' },
      { id: 'gapura-ciririp', name: 'Gapura Masuk Desa Ciririp', desc: 'Pintu masuk desa wisata alam.' }
    ]
  },
  {
    id: 'benteng-vredeburg',
    title: 'Museum Benteng Vredeburg',
    location: 'Ngupasan, Kec. Gondomanan, Kota Yogyakarta',
    unitPrice: 14000,
    rating: '9.4/10',
    category: 'Cagar Budaya Nasional',
    image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
    description: 'Benteng kolonial bersejarah abad ke-18 dengan diorama lengkap perjuangan nasional dan arsitektur peninggalan Belanda.',
    meetingPoints: [
      { id: 'gerbang-vredeburg', name: 'Pintu Gerbang Utama Benteng Vredeburg', desc: 'Titik nol kilometer Malioboro.' },
      { id: 'titik-nol', name: 'Monumen Serangan Umum 1 Maret', desc: 'Plaza terbuka depan kantor pos besar.' }
    ]
  },
  {
    id: 'gunung-bromo',
    title: 'Tur Sunrise Savana Gunung Bromo',
    location: 'Sumberkedawung, Kec. Leces, Kab. Probolinggo',
    unitPrice: 400000,
    rating: '9.3/10',
    category: 'Wisata Alam Gunung',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    description: 'Eksplorasi sunrise Bukit Penanjakan, kawah aktif Bromo, pasir berbisik, dan bukit teletubbies dengan armada Jeep 4x4.',
    meetingPoints: [
      { id: 'rest-sukapura', name: 'Rest Area Sukapura Probolinggo', desc: 'Titik kumpul Jeep 4x4 dan pemandu Bromo.' },
      { id: 'stasiun-probolinggo', name: 'Stasiun Probolinggo', desc: 'Penjemputan stasiun kereta api.' }
    ]
  }
];

export const TRANSPORT_OPTIONS: TransportOption[] = [
  {
    id: 'none',
    name: 'Kendaraan Mandiri / Bertemu di Titik Kumpul',
    capacityText: 'Tanpa Batasan Peserta (Mandiri)',
    minCapacity: 1,
    maxCapacity: 9999,
    price: 0,
    description: 'Peserta berangkat memakai kendaraan pribadi atau transportasi umum sendiri, dan langsung bertemu pemandu di Meeting Point yang disepakati.',
    facilities: ['Bebas Jam Tiba Mandiri', 'Koordinasi Langsung via WhatsApp Pemandu', 'Parkir Wisata Aman & Tersedia'],
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=400&q=80',
    badge: 'Paling Fleksibel',
    pickupPoints: ['Meeting Point Utama Wisata', 'Pintu Masuk Destinasi']
  },
  {
    id: 'ojek',
    name: 'Ojek Wisata Lokal Purwakarta (Driver + Helm SNI)',
    capacityText: 'Kapasitas 1 Orang / Unit Motor',
    minCapacity: 1,
    maxCapacity: 1,
    price: 45000,
    description: 'Armada sepeda motor dengan driver pemandu lokal. Sangat lincah menembus gang desa, jalan perbukitan sempit, dan hidden spot tersembunyi.',
    facilities: ['Driver Ramah Hafal Rute Lokal', 'Helm SNI Bersih & Wangi', 'BBM Sudah Termasuk', 'Jas Hujan Tersedia'],
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80',
    badge: 'Cocok Solo Traveler',
    pickupPoints: ['Stasiun Purwakarta', 'Alun-Alun', 'Hotel Area Kota']
  },
  {
    id: 'avanza',
    name: 'Mobil Avanza / Xenia Pariwisata AC (1-6 Kursi)',
    capacityText: 'Kapasitas 1 - 6 Kursi Penumpang',
    minCapacity: 1,
    maxCapacity: 6,
    price: 300000,
    description: 'Mobil keluarga nyaman dengan AC sejuk, audio santai, dan driver lokal berpengalaman. Siap antar-jemput dari stasiun atau hotel.',
    facilities: ['AC Double Blower Dingin', 'Driver Sopan & Tidak Merokok', 'BBM & Parkir Termasuk', 'Charger HP USB'],
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
    badge: 'Favorit 3-6 Orang',
    pickupPoints: ['Stasiun Purwakarta', 'Hotel / Penginapan', 'Alun-Alun']
  },
  {
    id: 'jeep-4x4',
    name: 'Jeep 4x4 Offroad Wisata Petualangan',
    capacityText: 'Kapasitas 1 - 4 Kursi Penumpang',
    minCapacity: 1,
    maxCapacity: 4,
    price: 450000,
    description: 'Sensasi petualangan offroad menembus lereng bukit, jalur bebatuan air terjun, dan spot sunrise pegunungan ekstrem yang tidak bisa dijangkau mobil biasa.',
    facilities: ['Driver Pro Bersertifikat Offroad', 'Unit Jeep 4WD Tangguh Terawat', 'Spot Foto Instagramable Atap Terbuka', 'BBM Sudah Termasuk'],
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80',
    badge: 'Sensasi Petualangan',
    pickupPoints: ['Basecamp Lereng Gunung', 'Rest Area Wanayasa', 'Stasiun Purwakarta']
  },
  {
    id: 'hiace',
    name: 'Toyota HiAce Commuter Pariwisata AC',
    capacityText: 'Kapasitas 10 - 14 Kursi Penumpang',
    minCapacity: 4,
    maxCapacity: 14,
    price: 650000,
    description: 'Minivan eksekutif dengan suspensi empuk, kabin senyap, dan AC double blower merata. Sangat ideal untuk keluarga besar & rombongan sedang.',
    facilities: ['AC Double Blower Dingin Merata', 'Driver Berpengalaman Ramah', 'BBM Sudah Termasuk', 'Port USB Charger Tiap Kursi'],
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80',
    badge: 'Favorit 10-14 Orang',
    pickupPoints: ['Stasiun Purwakarta', 'Lobi Hotel', 'Meeting Point Pilihan']
  },
  {
    id: 'elf-long',
    name: 'Isuzu Elf Long Pariwisata Eksekutif',
    capacityText: 'Kapasitas 15 - 19 Kursi Penumpang',
    minCapacity: 10,
    maxCapacity: 19,
    price: 850000,
    description: 'Armada elf long bertenaga tinggi yang lincah menaklukkan tanjakan wisata perbukitan dengan kapasitas lega untuk komunitas dan rombongan keluarga.',
    facilities: ['AC Dingin Tiap Baris', 'Audio & Karaoke Mikrofon', 'Driver + BBM Termasuk', 'Bagasi Belakang Luas untuk Oleh-Oleh'],
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=400&q=80',
    badge: 'Rekomendasi 15-19 Org',
    pickupPoints: ['Stasiun Kereta Api', 'Rest Area Tol', 'Titik Kumpul Rombongan']
  },
  {
    id: 'medium-bus',
    name: 'Medium Bus Pariwisata Jetbus (31 Seat)',
    capacityText: 'Kapasitas 25 - 35 Kursi Penumpang',
    minCapacity: 15,
    maxCapacity: 35,
    price: 1600000,
    description: 'Bus pariwisata kelas medium dengan konfigurasi kursi 2-2 reclining seat untuk kenyamanan maksimal rombongan besar sekolah, instansi, atau kantor.',
    facilities: ['AC Ducting Tiap Kursi', 'Reclining Seat Empuk Ergonomis', 'TV LCD & Audio Karaoke', 'Driver Berlisensi + Co-Driver', 'Asuransi Jasa Raharja'],
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80',
    badge: 'Rekomendasi 25-35 Org',
    pickupPoints: ['Kantor / Sekolah / Kampus', 'Stasiun Kereta', 'Rest Area']
  },
  {
    id: 'big-bus',
    name: 'Big Bus Pariwisata SHD (Super High Deck 50 Seat)',
    capacityText: 'Kapasitas 40 - 55 Kursi Penumpang',
    minCapacity: 30,
    maxCapacity: 55,
    price: 2750000,
    description: 'Bus pariwisata super premium dengan toilet kabin, bagasi tembus motor/koper besar, dan suspensi udara empuk untuk perjalanan wisata rombongan masal.',
    facilities: ['Toilet Bersih Dalam Bus', 'AC Central Dingin Maksimal', 'Dispenser Air Panas/Dingin', 'Port Charger Tiap Baris', '2 Driver Senior + Crew', 'Asuransi Jasa Raharja Penuh'],
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=400&q=80',
    badge: 'Super Rombongan 40-55 Org',
    pickupPoints: ['Titik Penjemputan Rombongan', 'Bandara / Stasiun', 'Kantor Pusat']
  }
];

export const FOOD_ADDON_ITEMS: FoodAddOnItem[] = [
  {
    id: 'food-sate-maranggi',
    umkmName: 'Mitra UMKM Sate Maranggi Hj. Yetty',
    name: 'Sate Maranggi Khas Purwakarta (10 Tusuk)',
    basePrice: 35000,
    description: 'Sate daging bakar bumbu rempah ketumbar manis gurih khas Purwakarta, disajikan dengan irisan tomat segar dan cabai rawit pedas uleg.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=80',
    category: 'Makanan Utama',
    variants: {
      groupName: 'Pilihan Jenis Daging',
      options: [
        { label: 'Sate Daging Sapi Lemak Manis (Favorit)', priceDiff: 0 },
        { label: 'Sate Daging Sapi Murni (Tanpa Lemak)', priceDiff: 5000 },
        { label: 'Sate Kambing Muda Empuk Spesial', priceDiff: 8000 },
        { label: 'Sate Ayam Bumbu Maranggi Gurih', priceDiff: -5000 }
      ]
    },
    spicyOptions: ['Tidak Pedas (Manis Gurih)', 'Pedas Sedang (Sambal Tomat 2 Sendok)', 'Pedas Nampol (Ekstra Rawit Merah)'],
    sideOptions: [
      { id: 'lontong', label: 'Tambah Lontong Daun Pisang Pulen', price: 5000 },
      { id: 'nasi-timbel', label: 'Tambah Nasi Timbel Bungkus Daun', price: 6000 },
      { id: 'sambal-ekstra', label: 'Ekstra Sambal Tomat Pedas Uleg', price: 3000 },
      { id: 'kerupuk-kulit', label: 'Kerupuk Kulit Sapi Renyah', price: 4000 }
    ]
  },
  {
    id: 'food-liwet-komplit',
    umkmName: 'Dapur Nasi Liwet Kastrol Ibu Nunung',
    name: 'Paket Nasi Liwet Kastrol Khas Sunda Komplit',
    basePrice: 38000,
    description: 'Nasi liwet wangi daun salam serai disajikan hangat dengan lauk pilihan, tahu tempe goreng, lalapan segar, dan sambal terasi dadak.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80',
    category: 'Makanan Utama',
    variants: {
      groupName: 'Pilihan Lauk Utama',
      options: [
        { label: 'Ayam Goreng Lengkuas Rempah', priceDiff: 0 },
        { label: 'Ayam Bakar Madu Gurih', priceDiff: 2000 },
        { label: 'Ikan Nila Goreng Kering Renyah', priceDiff: -3000 },
        { label: 'Bebek Goreng Kremes Sambal Ijo', priceDiff: 9000 }
      ]
    },
    spicyOptions: ['Sambal Terasi Jeruk Limau (Sedang)', 'Sambal Dadak Tomat Segar (Pedas)', 'Tanpa Sambal (Lalapan Saja)'],
    sideOptions: [
      { id: 'ikan-asin', label: 'Ikan Asin Jambal Roti Crispy', price: 6000 },
      { id: 'pete-bakar', label: '1 Papan Pete Bakar / Goreng', price: 10000 },
      { id: 'sayur-asem', label: '1 Mangkok Sayur Asem Sunda Hangat', price: 7000 }
    ]
  },
  {
    id: 'food-es-ciming',
    umkmName: 'Mitra UMKM Es Ciming Purwakarta Asli (Sejak 1970)',
    name: 'Es Ciming Segar Khas Purwakarta',
    basePrice: 15000,
    description: 'Minuman es legendaris sejak 1970 dengan kuah santan gula aren wangi, kelapa muda serut, kacang hijau empuk, cincau hitam, dan cendol kenyal.',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=500&q=80',
    category: 'Minuman & Segaran',
    variants: {
      groupName: 'Ukuran Porsi',
      options: [
        { label: 'Porsi Reguler Cup Segar', priceDiff: 0 },
        { label: 'Porsi Jumbo Spesial Mangkok Besar', priceDiff: 5000 }
      ]
    },
    sideOptions: [
      { id: 'kelapa-ekstra', label: 'Ekstra Daging Kelapa Muda', price: 3000 },
      { id: 'tape-ketan', label: 'Tambah Tape Ketan Hitam Manis', price: 3000 },
      { id: 'alpukat', label: 'Tambah Kerokan Buah Alpukat', price: 5000 }
    ]
  },
  {
    id: 'food-kelapa-muda',
    umkmName: 'Kedai Kelapa Muda Segar Situ Buleud',
    name: 'Es Kelapa Muda Batok Utuh Alami',
    basePrice: 18000,
    description: 'Kelapa muda segar dipetik langsung, disajikan utuh di batok dengan air kelapa manis alami dan daging kelapa lembut yang menyegarkan.',
    image: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=500&q=80',
    category: 'Minuman & Segaran',
    variants: {
      groupName: 'Pilihan Rasa Gula',
      options: [
        { label: 'Murni Tanpa Pemanis Tambahan', priceDiff: 0 },
        { label: 'Manis Gula Kelapa Asli (Cair)', priceDiff: 2000 },
        { label: 'Perasan Jeruk Nipis Segar (Es Degan Jeruk)', priceDiff: 3000 }
      ]
    },
    sideOptions: [
      { id: 'es-batu', label: 'Tambah Es Batu Dingin Terpisah', price: 1000 },
      { id: 'biji-selasih', label: 'Tambah Biji Selasih Segar', price: 2000 }
    ]
  },
  {
    id: 'food-kopi-simping',
    umkmName: 'Kopi Osing & Kriya Purwakarta Lestari',
    name: 'Kopi Tradisional & Simping Renyah Purwakarta',
    basePrice: 18000,
    description: 'Seduhan kopi robusta sangrai tradisional aroma harum disajikan dengan camilan pipih renyah Simping khas oleh-oleh Purwakarta.',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=500&q=80',
    category: 'Camilan & Oleh-Oleh',
    variants: {
      groupName: 'Pilihan Seduhan Kopi',
      options: [
        { label: 'Kopi Hitam Tubruk Tradisional Hangat', priceDiff: 0 },
        { label: 'Es Kopi Susu Gula Aren Asli', priceDiff: 4000 },
        { label: 'Teh Tarik Rempah Jahe Merah Hangat', priceDiff: 2000 }
      ]
    },
    sideOptions: [
      { id: 'simping-pack', label: '1 Bungkus Simping Kencur Renyah', price: 10000 },
      { id: 'simping-coklat', label: '1 Bungkus Simping Rasa Coklat Manis', price: 10000 },
      { id: 'colenak', label: 'Colenak Tape Bakar Saus Kinca Kelapa', price: 12000 }
    ]
  },
  {
    id: 'food-snack-box',
    umkmName: 'Pawon Kue Basah Tradisional Pasundan',
    name: 'Paket Snack Box Rombongan Wisata (3 Kue + Air Mineral)',
    basePrice: 16000,
    description: 'Kotak snack higienis praktis untuk rombongan trip: berisi pastel isi ayam telur, risoles mayo gurih, arem-arem daging, dan air mineral 330ml.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80',
    category: 'Camilan & Oleh-Oleh',
    variants: {
      groupName: 'Pilihan Varian Box',
      options: [
        { label: 'Paket Asin Gurih (Pastel + Risoles + Arem)', priceDiff: 0 },
        { label: 'Paket Manis Gurih (+ Pie Buah & Dadar Gulung)', priceDiff: 2000 },
        { label: 'Paket Premium (+ Lemper Ayam Suwir Jumbo)', priceDiff: 4000 }
      ]
    },
    sideOptions: [
      { id: 'tambah-air', label: 'Upgrade Air Mineral Botol 600ml Dingin', price: 2000 },
      { id: 'tisu-basah', label: 'Kemasan Box Jinjing Eksklusif + Tisu Basah', price: 1500 }
    ]
  },
  {
    id: 'food-madu-hutan',
    umkmName: 'Komunitas Petani Madu Hutan Lestari',
    name: 'Madu Hutan Liar Murni (Oleh-Oleh Kemasan Botol)',
    basePrice: 65000,
    description: 'Madu murni mentah (raw honey) dipanen lestari dari lebah hutan Apis dorsata tanpa proses pemanasan kimia, kaya enzim dan antioksidan.',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=500&q=80',
    category: 'Camilan & Oleh-Oleh',
    variants: {
      groupName: 'Ukuran Kemasan Botol Kaca',
      options: [
        { label: 'Kemasan Botol Kaca 250ml', priceDiff: 0 },
        { label: 'Kemasan Botol Kaca Jumbo 500ml', priceDiff: 55000 }
      ]
    },
    sideOptions: [
      { id: 'sendok-kayu', label: 'Sendok Ulir Kayu Madu Tradisional', price: 5000 },
      { id: 'tas-anyaman', label: 'Kemasan Tas Anyaman Pandan Ramah Lingkungan', price: 8000 }
    ]
  }
];
