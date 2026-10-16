# TODO — SIMKAR Absen Karyawan

## Implementasi shell Android terhubung ke server SIMKAR

- [x] Aplikasi Android membuka `https://ptpmn.co.id/simkar/public/auth/login` sebagai sumber utama aplikasi.
- [x] Alur autentikasi tetap mengikuti halaman login dan sesi yang disediakan server SIMKAR yang sudah ada.
- [x] WebView dioptimalkan untuk penggunaan mobile, termasuk viewport, cookie/sesi, JavaScript, dan perilaku tautan yang diperlukan situs.

## Dukungan presensi berbasis lokasi

- [x] Aplikasi meminta izin lokasi GPS Android pada saat dibutuhkan dan meneruskan data lokasi ke halaman web untuk fitur Presensi Mandiri.

## Navigasi dan ketahanan koneksi

- [x] Navigasi mundur kembali ke riwayat halaman WebView terlebih dahulu sebelum menawarkan keluar dari aplikasi.
- [x] Tersedia kontrol muat ulang untuk menyegarkan halaman SIMKAR yang sedang dibuka.
- [x] Tersedia indikator pemuatan saat halaman sedang diakses.
- [x] Kegagalan koneksi/server menampilkan pesan berbahasa Indonesia yang jelas dan opsi mencoba lagi.
- [x] Navigasi dibatasi secara aman agar alur utama tetap menggunakan domain/server SIMKAR tanpa endpoint backend baru.

## Verifikasi dan handoff build

- [x] TypeScript check dan lint bersih.
- [x] Preview Expo berjalan pada port yang ditentukan dan entry screen dapat dimuat.
- [x] Konfigurasi Android berisi permission lokasi dan ikon aplikasi SIMKAR.
- [ ] Source siap untuk Android APK/AAB melalui Dashboard; artefak release belum diklaim sebelum build aktual selesai.

## Prasyarat server produksi

- [ ] Endpoint `https://ptpmn.co.id/simkar/public/auth/login` harus menyajikan halaman login normal; Preview sempat menerima `HTTP 401 Unauthorized` dan probe TLS langsung dari Sandbox juga gagal pada percobaan lain, sehingga alur login end-to-end belum dapat dibuktikan.
