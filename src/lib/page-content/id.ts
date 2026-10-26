import type { BaseRoutePagesCopy } from "@/lib/page-copy";

export const idPages: BaseRoutePagesCopy = {
  product: {
    meta: {
      title: "Perangkat SismoSmart",
      description:
        "Perangkat seismik pra-peluncuran untuk rumah dan bangunan kecil, dirancang untuk merekam gerakan; kinerja, konektivitas, dan laporan masih menunggu validasi pilot.",
    },
    eyebrow: "Produk",
    title: "Perangkat",
    description:
      "Perangkat dinding bertenaga USB-C dalam tahap pra-peluncuran. Sensor, konektivitas, pelaporan, dan kinerja masih merupakan target desain.",
    deviceDescription:
      "Casing pilot dirancang untuk dipasang tetap di dinding. Hardware dan petunjuk pemasangan final akan dikonfirmasi bersama perangkat yang tervalidasi.",
    meterTopLabel: "Sensor",
    meterTopValue: "Target MEMS",
    meterBottomLabel: "Data",
    meterBottomValue: "Target keamanan",
    imageAlt: "Perangkat SismoSmart, tampak depan",
    specs: [
      { label: "Sensor", value: "Target MEMS kelas ADXL355" },
      { label: "Koneksi", value: "Target Wi-Fi + Bluetooth" },
      { label: "Pemasangan", value: "Target setup pilot" },
      { label: "Status", value: "Target LED RGB + app" },
    ],
    useCases: [
      { title: "Rumah dan apartemen", description: "Kandidat lokasi pilot untuk pengukuran tetap; penempatan disepakati per bangunan." },
      { title: "Kampus dan pabrik", description: "Pilot beberapa gedung dapat mengevaluasi visibilitas terpusat setelah alur perangkat tervalidasi." },
      { title: "Bengkel dan kantor", description: "Penggunaan pada bangunan kecil adalah hipotesis pilot, bukan implementasi komersial tervalidasi." },
      { title: "Kemitraan universitas", description: "Akses riset memerlukan perjanjian eksplisit, kontrol privasi, dan tujuan berbagi data yang jelas." },
    ],
    comparisonTitle: "Perbandingan",
    comparisonDescription:
      "SismoSmart dirancang sebagai perangkat tetap di antara sensor ponsel dan instrumentasi profesional. Sensitivitas, laporan, dan biaya masih merupakan asumsi validasi atau komersial.",
    comparisonRows: [
      { label: "Pemasangan", sismosmart: "Proses pilot", traditional: "Instalasi profesional bervariasi", mobile: "Setup app" },
      { label: "Perangkat tetap", sismosmart: "Target: terpasang pada bangunan", traditional: "Ya", mobile: "Tidak, ponsel bergerak" },
      { label: "Interpretasi struktur", sismosmart: "Validasi tertunda", traditional: "Alur ahli", mobile: "Bukan penilaian bangunan" },
      { label: "Harga", sismosmart: "Pra-peluncuran; belum ada harga publik", traditional: "Harga sistem profesional", mobile: "Sering gratis" },
    ],
    ctaLabel: "Daftar pilot",
    ctaHref: "/pilot-program",
  },
  howItWorks: {
    meta: {
      title: "Cara kerja SismoSmart",
      description:
        "Desain pra-peluncuran untuk mengukur gerakan, menyimpan data kejadian, dan menyiapkan informasi untuk validasi pilot serta tinjauan tenaga ahli.",
    },
    eyebrow: "Cara kerja",
    title: "Perangkat, cloud, app: bersama.",
    description:
      "Desain saat ini menggabungkan pengukuran lokal, jalur data terhubung, dan lapisan app/laporan. Deteksi, notifikasi, korelasi, dan laporan masih menunggu validasi pilot.",
    flow: [
      { title: "Pasang perangkat", description: "Penempatan pilot dipilih pada permukaan dalam ruangan yang stabil sesuai bangunan dan tujuan pengukuran." },
      { title: "Pasangkan dengan ponsel", description: "Bluetooth dan Wi-Fi adalah target provisioning; keamanan final bergantung pada tinjauan implementasi." },
      { title: "Bangun baseline", description: "Kalibrasi pilot dimaksudkan untuk merekam getaran harian dan menguji pemisahan gerakan yang tidak biasa." },
      { title: "Rekam kejadian", description: "Desain menargetkan rekaman lokal dan tampilan app/laporan setelahnya; waktu dan kelengkapan masih divalidasi." },
    ],
    signals: [
      { title: "Deteksi di perangkat", description: "Ini target desain. Ambang, positif palsu, kejadian terlewat, dan keandalan memerlukan bukti pilot berlabel." },
      { title: "Laporan pascakejadian", description: "Laporan masa depan dapat merangkum besaran tervalidasi untuk tinjauan ahli. Bukan penentu keamanan." },
      { title: "Hanya data yang perlu", description: "Alur data situs web didokumentasikan terpisah. Telemetri perangkat masa depan ditetapkan sebelum pengumpulan data pilot." },
    ],
    network: [
      { title: "Korelasi antarperangkat", description: "Ini target desain; manfaat terhadap konfirmasi dan alarm palsu belum dibuktikan." },
      { title: "Bukti struktural dari waktu ke waktu", description: "Perubahan terukur dapat memberi bukti tambahan kepada insinyur; bukan diagnosis." },
      { title: "Antarmuka sederhana", description: "Tampilan status yang jelas adalah target produk; status dan ambang final bergantung pada validasi." },
    ],
  },
  about: {
    meta: { title: "Tentang", description: "Siapa yang membuat SismoSmart dan mengapa. Tim dan sudut pandang kami setelah gempa 2023." },
    eyebrow: "Tentang",
    title: "Kami tinggal di Türkiye. Kami ingin bangunan kami sehat.",
    description: "Kami berkumpul setelah gempa Kahramanmaraş 2023 dan getaran terbaru di sekitar İstanbul. Kami ingin tahu bagaimana rumah dan kota kami merespons gempa. Jadi kami membuat perangkat ini.",
    story: [
      "Setelah gempa besar di Türkiye, pemeriksaan bangunan bisa memakan minggu atau bulan. Selama itu, keluarga tidak tahu apakah mereka bisa pulang.",
      "Kami tidak menghapus masa tunggu itu sepenuhnya. Pada akhirnya, insinyur harus masuk ke bangunan. Namun sebelum ia tiba, dapat ada lapisan data yang menunjukkan bangunan mana yang perlu diperiksa lebih dulu. Itulah yang sedang kami kerjakan.",
      "Tim kami punya penasihat akademik teknik sipil, dua peneliti MSc teknik sipil, dan pendiri di embedded dan software. Kami semua berbasis di Türkiye. Kami menguji perangkat di rumah sendiri.",
    ],
    principles: [
      { title: "Memberi informasi tanpa menakuti", description: "Tidak ada pemasaran bencana. Perangkat menciptakan kesiapan, bukan panik." },
      { title: "Jelas soal batas", description: "Kami akan menyebut apa yang tidak kami lakukan. Bukan peringatan resmi. Bukan pengganti laporan insinyur." },
      { title: "Mengembalikan data ke pemilik", description: "Data bangunan Anda milik Anda. Agregat anonim dapat dipakai akademia atau pemerintah. Data pribadi tidak dijual." },
    ],
    timeline: [
      { period: "Selesai", title: "Dasar produk dan sistem", description: "Konsep produk awal dan arsitektur sistem sudah dibentuk. Klaim publik tetap dibatasi oleh register bukti." },
      { period: "Saat ini", title: "Validasi pilot", description: "Target hardware, deteksi, notifikasi, konektivitas, dan pelaporan divalidasi sebelum klaim diperluas." },
      { period: "Berikutnya", title: "Bukti dan pembekuan desain", description: "BOM, algoritme, dan asumsi operasi dibekukan hanya setelah bukti uji meja dan lapangan ditinjau." },
      { period: "Nanti", title: "Sertifikasi dan manufaktur", description: "Sertifikasi, manufaktur, dan peluncuran mengikuti gerbang bukti. Tidak ada tanggal pengiriman publik yang dijanjikan." },
    ],
    team: [
      { name: "Pendiri", role: "Hardware, software, produk", bio: "Bertanggung jawab atas embedded systems, IoT, cloud, dan produk." },
      { name: "Penasihat akademik", role: "Teknik gempa", bio: "PhD teknik sipil. Memvalidasi algoritma kesehatan struktur secara ilmiah." },
      { name: "Insinyur sipil", role: "Kesehatan struktur dan lokasi pilot", bio: "Dua peneliti MSc teknik sipil. Memimpin algoritma bangunan dan validasi pilot." },
    ],
  },
  contact: {
    meta: { title: "Kontak", description: "Ingin bicara dengan SismoSmart? Ini kanal yang tepat. Produk, pilot, media, atau investor." },
    eyebrow: "Kontak",
    title: "Tulis, kami balas.",
    description: "Kanal tercepat saat ini adalah email. Subjek yang jelas sampai ke orang yang tepat.",
    channels: [
      { title: "Umum", description: "Pertanyaan produk, aplikasi pilot, minat pembelian", value: "info@sismosmart.com", href: "mailto:info@sismosmart.com" },
      { title: "Media", description: "Wawancara, press kit, kerja sama", value: "press@sismosmart.com", href: "mailto:press@sismosmart.com" },
      { title: "LinkedIn", description: "Update profesional dan kabar perusahaan", value: "linkedin.com/company/sismosmart", href: "https://www.linkedin.com/company/sismosmart" },
    ],
    form: {
      nameLabel: "Nama Anda",
      emailLabel: "Email",
      subjectLabel: "Subjek",
      messageLabel: "Pesan Anda",
      buttonLabel: "Kirim",
      consentLabel: "Saya setuju informasi ini diproses agar pesan saya dapat ditinjau dan dibalas.",
      note: "Kami hanya memakai informasi ini untuk membalas pesan Anda.",
      loadingLabel: "Mengirim...",
      successMessage: "Pesan Anda sudah terkirim. Kami akan membalas secepatnya.",
      errorMessage: "Ada masalah. Coba lagi.",
      missingEndpointMessage: "Form belum terhubung. Silakan email info@sismosmart.com.",
      rateLimitedMessage:
        "Terlalu banyak percobaan. Silakan coba lagi beberapa menit lagi.",
    },
  },
  privacy: {
    meta: { title: "Privasi", description: "Data apa yang kami kumpulkan, mengapa dipakai, dan dengan siapa dibagikan. Dijelaskan jelas." },
    eyebrow: "Privasi",
    title: "Kebijakan privasi",
    description: "Kami tidak mengumpulkan data yang tidak diperlukan. Data yang dikumpulkan dipakai hanya untuk tujuan yang disebutkan. Tidak dijual.",
    sections: [
      { title: "Data yang dikumpulkan", description: "Di situs aktif: email, isi formulir kontak, dan pilihan cookie. Data perangkat pilot yang direncanakan dapat mencakup gerakan, pengukuran lingkungan, status, dan lokasi perkiraan; kategori tepatnya didokumentasikan sebelum pengumpulan." },
      { title: "Untuk apa dipakai", description: "Data situs saat ini dipakai untuk membalas pesan, mengelola aplikasi pilot, dan mengirim komunikasi yang disetujui. Tujuan data perangkat masa depan ditetapkan dalam perjanjian sebelum pengumpulan." },
      { title: "Dengan siapa dibagikan", description: "Form dapat melewati penyedia yang dikonfigurasi. Pemroses, lokasi pemrosesan, transfer, dan retensi data perangkat masa depan ditetapkan sebelum pilot. Kami tidak menjual data pribadi." },
      { title: "Hak Anda", description: "Anda dapat mengakses, memperbaiki, menghapus, atau mengekspor data. Tulis ke info@sismosmart.com." },
    ],
  },
  terms: {
    meta: { title: "Syarat penggunaan", description: "Syarat dasar untuk memakai situs dan informasi sebelum peluncuran." },
    eyebrow: "Syarat",
    title: "Syarat penggunaan",
    description: "Situs ini belum diluncurkan penuh. Syarat berikut berlaku untuk fase ini.",
    sections: [
      { title: "Informasi", description: "Situs ini memberi informasi tentang SismoSmart dan menerima aplikasi pilot. Ini bukan layanan seismik resmi atau kanal peringatan gempa." },
      { title: "Bukan jaminan", description: "Perangkat sedang dikembangkan untuk mendukung kesiapan dan tinjauan pascakejadian. Tidak menggantikan peringatan resmi, instruksi darurat, atau laporan insinyur struktur." },
      { title: "Kekayaan intelektual", description: "Nama, logo, desain produk, dan isi situs SismoSmart milik SismoSmart. Tidak boleh disalin tanpa izin." },
      { title: "Kontak", description: "Pertanyaan ke info@sismosmart.com." },
    ],
  },
  press: {
    meta: { title: "Press kit", description: "Informasi, visual, dan kontak untuk media." },
    eyebrow: "Media",
    title: "Press kit",
    description: "Satu halaman sumber untuk media, mitra, dan permintaan wawancara.",
    sections: [
      { title: "Deskripsi singkat", description: "SismoSmart mengembangkan perangkat pemantauan seismik pra-peluncuran untuk rumah dan bangunan kecil, dirancang untuk merekam gerakan bangunan dan mendukung tinjauan pascakejadian oleh tenaga ahli. Validasi pilot, sertifikasi, dan manufaktur akan menentukan jadwal." },
      { title: "Kontak media", description: "Untuk wawancara, gambar, atau demo: press@sismosmart.com." },
    ],
    links: [
      { title: "Logo", description: "Logo vektor SVG", href: "/logo-symbol.svg" },
      { title: "Gambar produk", description: "Render resolusi tinggi", href: "/images/device/sismosmart-device-front.png" },
      { title: "Gambar media sosial", description: "Kartu 1200x630", href: "/images/og/sismosmart-og.png" },
    ],
  },
};
