import type { SiteCopy } from "@/lib/site";

export const idCopy: SiteCopy = {
  accessibility: { skipToContent: "Lewati ke konten" },
  meta: {
    title: "Pemantauan seismik untuk bangunan Anda",
    description:
      "SismoSmart adalah monitor seismik bangunan pra-peluncuran yang dirancang untuk merekam gerakan saat guncangan dan memberi data untuk tinjauan pascakejadian oleh tenaga ahli.",
  },
  navigation: {
    eyebrow: "Pemantauan seismik untuk bangunan",
    primaryCta: "Daftar pilot",
    links: [
      { label: "Teknologi", href: "/technology" },
      { label: "Produk", href: "/product" },
      { label: "Pilot", href: "/pilot-program" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  hero: {
    badge: "Startup hardware tahap awal",
    title: "Kami sedang mengembangkan perangkat yang mengukur bagaimana bangunan Anda bergerak saat gempa.",
    description:
      "SismoSmart adalah perangkat dinding pra-peluncuran yang dirancang untuk mengukur dan merekam gerakan bangunan. Deteksi, notifikasi, konektivitas, dan kinerja masih menunggu validasi pilot.",
    primaryCta: "Daftar pilot",
    secondaryCta: "Ringkasan investor",
    tertiaryCta: "Lihat teknologi",
    primaryHref: "/pilot-program",
    secondaryHref: "/investors",
    tertiaryHref: "/technology",
    stats: [
      { label: "Pemasangan", value: "Tetap di dinding" },
      { label: "Deteksi", value: "Di perangkat" },
      { label: "Target sampling", value: "250 Hz, 3 sumbu" },
      { label: "Target daya", value: "30-60 dtk superkapasitor" },
    ],
    deviceEyebrow: "Perangkat SismoSmart",
    deviceTitle: "Perangkat 100 × 100 mm yang ditempel di dinding dan ditenagai dari stopkontak",
    deviceDescription:
      "Anda menempelkannya ke dinding, mencolokkannya, memasangkannya lewat aplikasi, lalu memberinya Wi-Fi. Setelah itu ia bekerja sendiri: mengukur getaran bangunan tanpa mengganggu keseharian Anda. Fitur di bawah ini masih dalam tahap desain.",
    deviceSpecs: ["Pengukuran gerak tiga sumbu", "Perekaman kejadian secara lokal di perangkat", "Enkripsi data perangkat"],
    meterTopLabel: "Deteksi",
    meterTopValue: "Menunggu validasi",
    meterBottomLabel: "Data",
    meterBottomValue: "Enkripsi direncanakan",
    imageAlt: "Perangkat pemantauan seismik SismoSmart dengan LED status",
  },
  trust: {
    eyebrow: "Posisi kami",
    title: "Ada hal-hal yang tidak bisa dilakukan perangkat ini.",
    description:
      "SismoSmart masih dalam fase pilot. Yang ia lakukan adalah merekam apa yang terjadi di dalam bangunan Anda dan mengubahnya menjadi data yang bisa Anda tinjau nanti. Kami tidak bersaing dengan sistem peringatan resmi atau dengan inspeksi struktur setelah gempa. Keduanya tetap pada tempatnya. Kami mengisi celah di antaranya.",
    items: [
      { label: "Tahap", value: "Pilot" },
      { label: "Tugas utama", value: "Merekam gerakan" },
      { label: "Keputusan struktural", value: "Tetap di insinyur" },
    ],
  },
  howItWorks: {
    eyebrow: "Cara kerja",
    title: "Pemasangan hanya beberapa menit, sisanya berjalan di belakang layar.",
    description:
      "Kalibrasi pilot ditujukan untuk mempelajari profil getaran normal bangunan dan menguji apakah gerakan yang tidak biasa dapat dibedakan dari kebisingan harian. Positif palsu dan kejadian terlewat masih mungkin.",
    steps: [
      { title: "Pasang di dinding", description: "Pilih dinding dalam ruangan yang stabil. Perekatnya sudah terpasang, dan ada lubang sekrup kalau Anda ingin memasangnya lebih kokoh." },
      { title: "Pasangkan dari aplikasi", description: "Aplikasi menemukan perangkat lewat Bluetooth. Anda memasukkan sandi Wi-Fi satu kali saja, selesai." },
      { title: "Ia mempelajari bangunan", description: "Kalibrasi pilot ditujukan untuk membangun garis dasar dari getaran sehari-hari seperti lalu lintas dan angin. Metodenya masih memerlukan bukti lapangan sebelum dapat disebut andal." },
      { title: "Memberi notifikasi saat guncangan dimulai", description: "Desain dapat mengirim notifikasi setelah deteksi lokal. Waktu notifikasi dan logika konfirmasi antarperangkat masih menunggu validasi pilot." },
      { title: "Merekam kejadiannya", description: "Desainnya mencakup penyimpanan kejadian secara lokal dan unggahan ke cloud saat koneksi tersedia. Alur lengkapnya harus divalidasi lewat pilot sebelum diperlakukan sebagai kemampuan perangkat yang sudah berjalan." },
      { title: "Lebih banyak perangkat, lebih baik", description: "Beberapa perangkat dapat memberi bukti yang berguna tentang gerakan relatif antarlantai dan korelasi kejadian. Akurasi dan pengaruhnya terhadap alarm palsu masih perlu validasi pilot." },
    ],
  },
  features: {
    eyebrow: "Apa fungsinya",
    title: "Sebenarnya ia mengerjakan beberapa tugas berbeda sekaligus.",
    description:
      "Produk ini dirancang di sekitar rekaman kejadian dan bukti gerakan bangunan jangka lebih panjang. Notifikasi dan interpretasi kesehatan struktur adalah target validasi, bukan hasil yang dijamin.",
    items: [
      { accent: "01", title: "Target deteksi", description: "Desain saat ini menargetkan sensor MEMS kelas ADXL355 dan sampling tiga sumbu 250 Hz. Klaim deteksi dan kinerja memerlukan bukti uji meja dan pilot." },
      { accent: "02", title: "Target notifikasi", description: "Perilaku notifikasi masih merupakan target validasi pilot. SismoSmart bukan layanan darurat atau sistem peringatan resmi; ikuti peringatan resmi." },
      { accent: "03", title: "Bukti struktural", description: "Perubahan karakteristik getaran yang terukur dapat memberi bukti tambahan kepada insinyur. Ini bukan diagnosis dan tidak menentukan apakah bangunan aman." },
      { accent: "04", title: "Membuat laporan setelah gempa", description: "Laporan pascakejadian yang direncanakan bertujuan merangkum gerakan terukur untuk tinjauan oleh tenaga ahli. Isi laporan dan interpretasinya masih menunggu validasi pilot." },
      { accent: "05", title: "Membaca suhu dan kelembapan", description: "Pengukuran lingkungan adalah target desain untuk membantu memisahkan efek musiman dari perubahan lain. Dengan sendirinya ini tidak mengidentifikasi kerusakan." },
      { accent: "06", title: "Korelasi antarperangkat", description: "Korelasi beberapa perangkat adalah target desain. Dampaknya pada waktu konfirmasi dan alarm palsu belum dibuktikan lewat pilot." },
    ],
  },
  demo: {
    eyebrow: "Alur data",
    title: "Pengukuran dimulai di perangkat dan berakhir di ponsel Anda.",
    description:
      "Desain saat ini mengukur secara lokal dan ditujukan untuk mengirim data perangkat dengan aman saat koneksi tersedia. Keamanan perangkat, laporan, dan tren masih menunggu validasi pilot.",
    previewLabel: "Rekaman bangunan",
    networkLabel: "Jaringan lingkungan",
    sensorLabel: "Perangkat",
    sensorValue: "Aktif",
    eventLabel: "Kejadian terakhir",
    eventValue: "Terekam, bisa ditinjau",
    bullets: [
      "Desain saat ini menargetkan sensor kelas ADXL355, sampling tiga sumbu 250 Hz, dan sasaran kebisingan yang terdokumentasi; kinerja akhir menunggu daftar komponen (BOM) yang dibekukan dan pengujian meja.",
      "Anda bisa melihat data getaran bangunan tanpa menyerahkan informasi pribadi.",
      "Perangkat tidak mengambil keputusan menggantikan insinyur. Ia memberi insinyur data yang lebih baik.",
    ],
    cta: "Lihat teknologi",
    ctaHref: "/technology",
  },
  proof: {
    eyebrow: "Jalur pilot",
    title: "Kami ingin mencobanya dulu di segelintir bangunan nyata.",
    description:
      "Sebelum produk ini dibesarkan, kami ingin melihatnya di lapangan. Masukan dari pilot pertama akan menentukan bentuk akhir perangkatnya. Untuk sekarang kami berbicara dengan tiga kelompok.",
    cards: [
      { title: "Apartemen", description: "Jumlah perangkat, durasi, kepemilikan, dan ketentuan komersial disepakati per lokasi. Halaman ini tidak menjanjikan perangkat gratis atau durasi pilot tetap.", highlight: "Ketentuan disepakati" },
      { title: "Kampus dan pabrik", description: "Fasilitas dengan lebih dari satu gedung. Satu perangkat per gedung, semuanya terlihat dari satu dashboard.", highlight: "Korporat" },
      { title: "Kemitraan universitas", description: "Akses riset memerlukan ketentuan pilot yang jelas, kontrol privasi, dan perjanjian berbagi data terpisah. Ini bukan alur data bawaan.", highlight: "Kolaborasi akademik" },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Pertanyaan yang sering diajukan",
    description: "Kalau pertanyaan Anda ada di sini, jawabannya juga ada. Kalau tidak, tulis ke info@sismosmart.com dan kami jawab. Daftar lengkapnya ada di halaman FAQ.",
    items: [
      { title: "Apakah perangkat ini memperingatkan sebelum gempa?", description: "Tidak. SismoSmart bukan layanan peringatan dini dan tidak menjanjikan peringatan sebelum gempa. Pilot dapat mengevaluasi notifikasi berlatensi rendah setelah deteksi lokal; untuk keadaan darurat, ikuti peringatan resmi." },
      { title: "Apa bedanya dengan peringatan gempa Google?", description: "Google memakai akselerometer di ponsel. Gratis, sudah ada di semua orang, dan bekerja dengan baik. Tapi yang ia ukur adalah sumber gempanya, bukan bangunan Anda. Kami melakukan sebaliknya: bagaimana bangunan Anda bergetar, bagaimana ia berubah menurut musim, dan dalam kondisi apa ia setelah gempa. Ponsel tidak bisa menjawab itu." },
      { title: "Bisakah satu perangkat menyatakan bangunan saya aman?", description: "Tidak bisa. Yang berhak menyatakan sebuah bangunan aman atau tidak aman adalah insinyur, bukan perangkat. Yang dilakukan perangkat adalah meninggalkan data konkret untuk insinyur itu." },
      { title: "Apakah pemasangannya sulit?", description: "Anda colokkan kabel USB-C ke stopkontak, tempelkan perangkat ke dinding dengan perekat di belakangnya, lalu pasangkan lewat aplikasi. Tanpa bor dan tanpa teknisi. Lima menit selesai." },
      { title: "Bagaimana jika listrik atau internet padam?", description: "Desain saat ini menargetkan penyimpanan lokal saat jaringan putus dan jembatan daya singkat dengan superkapasitor saat listrik padam. Durasi tepat dan pengiriman ujung-ke-ujung masih menunggu validasi." },
      { title: "Kapan mulai dijual?", description: "Belum ada tanggal penjualan publik yang pasti. SismoSmart masih pra-peluncuran; bukti pilot, kesiapan hardware, sertifikasi, dan manufaktur akan menentukan jadwal." },
    ],
  },
  newsletter: {
    eyebrow: "Hubungi kami",
    title: "Mari bicara sebelum peluncuran.",
    description:
      "Kalau Anda pengelola gedung yang ingin ikut pilot, investor, atau perwakilan organisasi mitra, ceritakan singkat apa yang Anda cari. Kami arahkan ke orang yang tepat.",
    inputLabel: "Email",
    placeholder: "anda@perusahaan.com",
    button: "Kirim",
    consent: "Saya setuju menerima email tentang peluncuran, pilot, dan kabar investor SismoSmart.",
    note: "Kami memakai email Anda hanya untuk tujuan ini.",
    loading: "Mengirim...",
    success: "Pesan Anda sudah sampai. Kami segera menghubungi Anda.",
    error: "Ada masalah. Coba lagi.",
    missingEndpoint: "Form belum terhubung. Anda bisa email langsung ke info@sismosmart.com.",
    rateLimited:
      "Terlalu banyak percobaan. Silakan coba lagi beberapa menit lagi.",
  },
  footer: {
    legal: "SismoSmart. Semua hak dilindungi.",
  },
};
