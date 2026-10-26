import { makeExtraPages } from "@/lib/page-content/extra-pages/shared";

export const idExtraPages = makeExtraPages({
  technology: {
    eyebrow: "Teknologi",
    metaTitle: "Teknologi: bagaimana SismoSmart mengukur",
    metaDescription:
      "Ringkasan teknis pra-peluncuran tentang target desain sensor, rekaman kejadian, dan analisis; deteksi serta kinerja masih menunggu validasi pilot.",
    title: "Apa yang ada di dalam perangkat, dan bagaimana datanya sampai ke Anda",
    description:
      "SismoSmart adalah sistem pengukuran pra-peluncuran. Halaman ini menjelaskan target desain saat ini untuk deteksi, perekaman kejadian, dan pelaporan, serta memisahkannya dari kemampuan yang masih memerlukan bukti pilot.",
    sections: [
      ["Akselerometer MEMS", "Desain saat ini menargetkan sensor MEMS kelas ADXL355, sampling tiga sumbu 250 Hz, dan sasaran kebisingan terdokumentasi. Pilihan sensor final dan klaim kinerja memerlukan daftar komponen (BOM) yang dibekukan serta bukti uji meja."],
      ["Deteksi STA/LTA", "Perangkat membandingkan rata-rata setengah detik terakhir dengan rata-rata tiga puluh detik terakhir. Lonjakan mendadak pada rasio itu menandai kemungkinan adanya kejadian. Metodenya bernama STA/LTA dan itu standar dalam seismologi. Kalibrasi pilot ditujukan untuk membedakan kebisingan bangunan biasa dari guncangan, tetapi hasil positif palsu atau kejadian yang terlewat masih mungkin sampai validasi lapangan selesai."],
      ["Buffer kejadian lokal", "Buffer kejadian lokal saat koneksi hilang adalah target desain. Durasi buffer dan pemulihan pengiriman masih menunggu validasi pilot ujung-ke-ujung."],
      ["Konfirmasi cloud", "Korelasi beberapa perangkat adalah target desain. Jendela pemicu, aturan konfirmasi, dan dampak pada alarm palsu harus dibuktikan dengan data pilot berlabel."],
      ["Pemantauan kesehatan struktur", "Perubahan karakteristik getaran terukur dapat memberi bukti tambahan kepada insinyur. Metode ini masih dalam validasi dan tidak mendiagnosis kerusakan atau menentukan keamanan bangunan."],
      ["Laporan untuk insinyur", "Laporan yang direncanakan dapat merangkum gerakan terukur dengan besaran teknik standar. Bidang, ketidakpastian, dan alur interpretasi masih menunggu validasi pilot serta tinjauan ahli."],
      ["Konektivitas", "Arsitektur saat ini menargetkan Wi-Fi untuk perangkat awal. Seluler atau LoRa berada di peta jalan dan tidak disajikan sebagai kemampuan yang sudah berjalan."],
      ["Daya", "Desain hardware menargetkan daya USB-C dan jembatan superkapasitor singkat. Durasi dan perilaku pengiriman saat listrik padam memerlukan uji meja dan pilot."],
      ["Sertifikasi", "Sertifikasi direncanakan, belum selesai. CE/RED, BTK, RoHS, WEEE, FCC, atau persetujuan lain hanya akan diklaim setelah ada bukti dokumenter untuk model dan pasar terkait."],
    ],
  },
  pilotProgram: {
    eyebrow: "Program pilot",
    metaTitle: "Pendaftaran program pilot",
    metaDescription:
      "Pendaftaran pilot untuk apartemen, kampus, pabrik, dan gedung riset. Cakupan, jumlah perangkat, durasi, dan ketentuan komersial disepakati per lokasi.",
    title: "Kami ingin melihat perangkat ini dulu di bangunan Anda.",
    description:
      "Produk belum dijual luas. Yang kami cari pada tahap ini adalah sedikit lokasi yang serius dan orang yang mau bilang apa yang tidak jalan. Kalau Anda masuk salah satu dari empat kelompok di bawah, formulir di bagian bawah adalah pintu masuknya.",
    sections: [
      ["Apartemen", "Kami mulai dengan satu perangkat di satu unit. Kalau pengelola gedung ikut, kami menambah perangkat di lantai lain. Kami membantu proses instalasi dan berkoordinasi dengan pengelola."],
      ["Kampus dan pabrik", "Beberapa bangunan, satu dashboard terpusat. Setiap bangunan menyimpan rekamannya sendiri. Sebelum memasang, kami membahas topologi jaringan dan syarat keamanan bersama tim IT Anda."],
      ["Pilot kota", "Penyebaran skala lingkungan yang memperlihatkan di wilayah mana gempa yang sama terasa lebih kuat. Data pribadi sepenuhnya berada di luar alur ini. Hanya data agregat per bangunan atau per lokasi yang dibagikan."],
      ["Mitra riset", "Departemen teknik gempa di universitas. Data mentah dapat dibuka untuk analisis akademik sebagai imbalan masukan dan peluang publikasi bersama, tetapi hanya dengan perjanjian kerahasiaan dan berbagi data. Alur itu belum ada."],
      ["Yang kami tawarkan", "Cakupan pilot disepakati per kasus. Jumlah perangkat, durasi, kepemilikan, dukungan, dan ketentuan komersial ditetapkan dalam perjanjian pilot, bukan dijanjikan di halaman ini."],
      ["Yang kami minta sebagai gantinya", "Anda mengoordinasikan instalasi dengan pengelola gedung atau staf. Kami mengadakan panggilan masukan sekitar lima belas menit sebulan. Kalau ada kejadian, kami minta catatan singkat. Di akhir kami ingin menerbitkan studi kasus pendek, dan kami senang hati tidak mencantumkan nama Anda."],
      ["Dari pendaftaran ke instalasi", "Pendaftaran ditinjau bersama kondisi bangunan, akses, jaringan, privasi, dan keselamatan. Waktu, panjang perjanjian, pengiriman, dan instalasi bergantung pada pilot terpilih dan dikonfirmasi langsung."],
    ],
  },
  investors: {
    eyebrow: "Investor",
    metaTitle: "Investor: ringkasan putaran awal",
    metaDescription:
      "Ringkasan investor kualitatif pra-peluncuran. Pembiayaan, harga, peta jalan, dan asumsi komersial terbaru dibagikan langsung karena dapat berubah.",
    title: "Ada satu jendela setelah gempa yang tidak diukur siapa pun.",
    description:
      "Setelah gempa besar di Türkiye, inspeksi struktur memakan waktu berminggu-minggu. Dalam minggu-minggu itu keluarga menebak-nebak, bisnis berhenti, dan asuransi mampat. SismoSmart adalah startup hardware yang mencoba menutup jendela itu dengan data bangunan itu sendiri.",
    sections: [
      ["Masalah", "Gempa besar dapat menciptakan antrean inspeksi. SismoSmart meneliti apakah data gerakan bangunan tetap dapat memberi bukti tambahan untuk prioritas; bukan pengganti inspeksi dan tidak menentukan keamanan."],
      ["Mengapa sekarang", "Sensor MEMS modern dan hardware terhubung membuat pemantauan tetap berbiaya lebih rendah lebih praktis. Ekonomi komponen dan kinerja final tetap asumsi sampai desain dibekukan."],
      ["Pasar", "Fokus komersial awal adalah Türkiye. Ekspansi berikutnya bergantung pada permintaan tervalidasi, sertifikasi, manufaktur, dan mitra lokal; halaman ini tidak mempublikasikan ukuran pasar tanpa audit sebagai fakta terkini."],
      ["Produk", "Varian hardware, harga, langganan, dan unit ekonomi masih merupakan asumsi perencanaan. Ketentuan komersial terbaru dan model keuangan dibagikan langsung kepada investor yang relevan."],
      ["Tim", "Proyek menggabungkan produk/perangkat lunak dengan masukan teknik sipil dan gempa. Komposisi tim dan relasi penasihat dapat berubah; materi due diligence terbaru dibagikan langsung."],
      ["Kompetisi", "Lanskap mencakup sistem peringatan resmi, peringatan ponsel, instrumentasi profesional, dan produk pemantauan lain. Hipotesis SismoSmart adalah pengukuran tetap pada bangunan dan bukti pascakejadian; diferensiasi masih perlu validasi."],
      ["Peta jalan", "Urutan aktif adalah validasi pilot, penyempurnaan hardware/software, tinjauan bukti, kesiapan sertifikasi/manufaktur, lalu peluncuran hanya setelah gerbang itu terpenuhi. Tidak ada kuartal yang dijanjikan."],
      ["Putaran awal", "Jumlah pendanaan, masa bertahan kas, alokasi, serta asumsi hibah atau kredit adalah input perencanaan bertanggal. Ketentuan pembiayaan terbaru dibagikan langsung, bukan disimpulkan dari angka publik lama."],
      ["Yang kami cari", "Investor angel dan dana tahap awal yang pernah melihat startup hardware. Mitra dengan akses ke regulasi, manufaktur, dan jaringan asuransi di Türkiye lebih berharga bagi kami daripada uang cepat. Dokumen teknis rinci dan model keuangan kami bagikan di bawah perjanjian kerahasiaan."],
    ],
  },
  faq: {
    eyebrow: "FAQ",
    metaTitle: "Pertanyaan yang sering diajukan",
    metaDescription:
      "Jawaban langsung tentang peringatan gempa, keamanan bangunan, data, privasi, instalasi, dan waktu peluncuran.",
    title: "Pertanyaan yang sering diajukan",
    description:
      "Produk gempa gampang sekali dijanjikan berlebihan. Kami berusaha menjaga batas perangkat ini tetap terlihat. Kalau pertanyaan Anda belum terjawab di sini, tulis ke info@sismosmart.com.",
    sections: [
      ["Apakah perangkat ini memperingatkan saya sebelum gempa?", "Tidak. SismoSmart bukan layanan peringatan dini dan tidak menjanjikan peringatan sebelum gempa. Pilot dapat mengevaluasi notifikasi berlatensi rendah setelah deteksi lokal; ikuti peringatan resmi untuk keadaan darurat."],
      ["Bisakah satu perangkat menyatakan bangunan saya aman?", "Tidak bisa. Yang berhak menyatakan sebuah bangunan aman atau tidak aman adalah insinyur, bukan perangkat. Yang dilakukan perangkat adalah meninggalkan data konkret untuk insinyur itu."],
      ["Data apa yang Anda kumpulkan?", "Pembacaan getaran, suhu, kelembapan, tekanan, dan status kerja perangkat itu sendiri. Kami tidak menautkan informasi pribadi ke perangkat dan tidak menjual data Anda kepada siapa pun. Rinciannya ada di halaman Privasi."],
      ["Apakah lokasi persis saya terbuka?", "Kami tahu lokasi perangkat Anda pada tingkat lingkungan, karena itu diperlukan untuk mencocokkan kejadian dengan perangkat di sekitarnya. Apa pun yang lebih rinci hanya dibagikan dengan perjanjian pilot yang eksplisit."],
      ["Bisakah peneliti mengakses data saya?", "Hanya setelah data dianonimkan dan hanya dengan perjanjian terpisah dengan Anda. Alur itu belum ada; masih ada di peta jalan."],
      ["Apa bedanya dari peringatan gempa Google?", "Google memakai akselerometer di ponsel. Gratis, sudah ada di semua orang, dan bekerja dengan baik. Tapi yang ia ukur adalah sumber gempanya, bukan bangunan Anda. Kami melakukan sebaliknya: bagaimana bangunan Anda bergetar, bagaimana ia berubah menurut musim, dan dalam kondisi apa ia setelah gempa. Ponsel tidak bisa menjawab itu."],
      ["Apa yang terjadi saat internet putus?", "Buffer lokal saat jaringan putus adalah target desain. Kemampuan perangkat pilot menyimpan lalu mengunggah kejadian bergantung pada hardware, firmware, dan jalur koneksi yang tervalidasi."],
      ["Bagaimana saat listrik padam?", "Jembatan superkapasitor singkat adalah target hardware. Durasi tepat dan penyelesaian atau pengiriman kejadian saat padam membutuhkan bukti uji meja dan pilot."],
      ["Seberapa sulit instalasinya?", "Anda colokkan kabel USB-C ke stopkontak, tempelkan perangkat ke dinding dengan perekat di belakangnya, lalu pasangkan lewat aplikasi. Tanpa bor dan tanpa teknisi. Lima menit selesai."],
      ["Berapa banyak yang sebaiknya dipasang dalam satu bangunan?", "Belum ada jumlah universal yang tervalidasi. Penempatan tergantung bangunan, tujuan pengukuran, dan tinjauan teknik; susunan multi-perangkat dievaluasi per lokasi."],
      ["Apa arti PGA, PGV, dan MMI?", "PGA, PGV, dan intensitas Modified Mercalli adalah konsep standar. Laporan SismoSmart di masa depan hanya akan menggunakan besaran terukur atau turunan setelah metode dan ketidakpastiannya tervalidasi."],
      ["Apa yang dikatakan frekuensi alami?", "Bangunan memiliki karakteristik getaran terukur termasuk frekuensi alami. Perubahan dapat memberi bukti tambahan, tetapi tidak mendiagnosis kerusakan atau keamanan sendirian."],
      ["Ke arah mana perangkat harus menghadap?", "Ada panah ke atas di bagian belakang; arahkan ke langit-langit. Usahakan sumbu X dan Y perangkat sejajar dengan arah horizontal bangunan. Kalau terpasang meleset 90 derajat, datanya masih terpakai, hanya nilainya sedikit berkurang."],
      ["Apakah perangkat merekam suara?", "Tidak. Tidak ada mikrofon di dalamnya, hanya akselerometer yang mengukur getaran tanah. Merekam percakapan atau suara sekitar butuh sensor yang sama sekali berbeda."],
      ["Apakah data saya meninggalkan Türkiye?", "Lokasi data pilot belum final. Sebelum data perangkat dikumpulkan, setiap perjanjian pilot akan menjelaskan lokasi pemrosesan, transfer, masa simpan, dan dasar hukum yang berlaku."],
      ["Kapan mulai dijual?", "Belum ada tanggal penjualan publik yang pasti. SismoSmart masih pra-peluncuran; bukti pilot, kesiapan hardware, sertifikasi, dan manufaktur akan menentukan jadwal."],
    ],
  },
  security: {
    eyebrow: "Keamanan",
    metaTitle: "Keamanan",
    metaDescription:
      "Bagaimana kami menangani keamanan situs, persetujuan, data perangkat, pengiriman terenkripsi, dan privasi selama fase pilot.",
    title: "Data yang tidak pernah dikumpulkan adalah data yang tidak bisa bocor.",
    description:
      "Itu aturan dasar kami. Saat ini yang sudah berjalan hanyalah situs web, tapi sisi perangkat kami bangun dengan aturan yang sama.",
    sections: [
      ["Data minimal secara default", "Situs web yang aktif saat ini hanya mengumpulkan data yang dijelaskan di halaman Privasi. Telemetri perangkat masa depan masih merupakan area desain produk dan kebijakan yang akan didokumentasikan sebelum pilot."],
      ["Persetujuan sebelum analitik", "Analitik web hanya dimuat setelah Anda memberi persetujuan. Anda bisa membatalkan pilihan itu kapan saja lewat tautan di bagian bawah halaman."],
      ["Pengiriman terenkripsi", "Situs web saat ini menggunakan HTTPS dan header keamanan. Enkripsi perangkat serta siklus hidup kunci adalah target desain sampai protokol yang diterapkan ditinjau dan divalidasi."],
      ["Tidak ada rahasia yang sampai ke browser", "Kunci privat dan token layanan tidak pernah muncul di kode yang dikirim ke browser. Semuanya tetap di konfigurasi sisi server yang terlindungi."],
      ["Pelaporan kerentanan", "Kalau Anda menemukan masalah keamanan di situs atau di materi pra-peluncuran, tulis ke info@sismosmart.com. Kami berterima kasih kepada peneliti yang mengungkapkannya secara bertanggung jawab."],
      ["Rencana keamanan perangkat", "Firmware bertanda tangan, penyimpanan terenkripsi, kunci per perangkat, dan pembaruan dengan rollback adalah target keamanan, bukan kemampuan yang sudah berjalan. Klaim akan dibuat hanya setelah ada bukti implementasi dan tinjauan."],
    ],
  },
});
