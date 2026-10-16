# Rencana SIMKAR Absen Karyawan

## Ruang lingkup dan pendekatan

Aplikasi Android akan menjadi shell native ringan yang memuat aplikasi web SIMKAR yang sudah ada di `https://ptpmn.co.id/simkar/public/auth/login`. Karena server saat ini menggunakan autentikasi berbasis sesi PHP dan belum menyediakan endpoint JSON/mobile khusus, aplikasi tidak menggandakan logika bisnis atau membuat backend baru. React Native WebView mempertahankan cookie/sesi server, JavaScript, viewport responsif, serta alur login dan presensi yang sudah berjalan.

Fokus aplikasi:
- membuka halaman login SIMKAR sebagai halaman awal;
- meminta izin lokasi Android sebelum halaman presensi digunakan, sehingga geolocation JavaScript dari SIMKAR dapat dipakai untuk geofence;
- menjaga navigasi internal di domain SIMKAR, dengan tautan eksternal dibuka melalui browser sistem;
- menyediakan indikator loading, tombol muat ulang, pesan koneksi gagal, dan tombol kembali Android yang mengikuti history WebView;
- menghindari penyimpanan kredensial di sisi aplikasi.

## Struktur proyek

- `app/_layout.tsx`: shell routing dan provider Expo starter.
- `app/(tabs)/index.tsx`: entry screen aplikasi; menampilkan WebView native atau fallback preview web.
- `components/simkar-webview.native.tsx`: integrasi WebView native, permission lokasi, navigasi, error state, dan domain allow-list.
- `components/simkar-webview.web.tsx`: fallback iframe untuk Preview web.
- `constants/simkar.ts`: URL server SIMKAR dan konfigurasi domain.
- `app.config.ts`: nama aplikasi, ikon, package Android, dan izin lokasi.
- `assets/images/*`: identitas visual SIMKAR untuk launcher/splash.
- `plan.md` dan `TODO.md`: keputusan implementasi dan status outcome.

## Desain

### Alternatif gaya

- **Portal kerja teal** (0,06): antarmuka utilitarian dengan aksen teal yang merujuk identitas SIMKAR.
- **Monokrom enterprise** (0,04): shell putih/abu dengan kontrol teknis yang sangat netral.
- **Kartu produktivitas** (0,08): shell berlapis dengan panel status dan tombol aksi yang lebih menonjol.

### Gaya terpilih: Portal kerja teal

- **Design Movement**: utilitarian enterprise mobile; shell hanya memperjelas status dan akses, bukan menggantikan UI server.
- **Core Principles**: jelas, cepat dipahami, tidak mengganggu halaman SIMKAR, dan aman untuk data sesi.
- **Color Philosophy**: teal gelap memberi kontinuitas dengan tema SIMKAR dan membedakan status aplikasi; putih/abu menjaga keterbacaan saat loading atau offline.
- **Layout Paradigm**: WebView mengambil hampir seluruh layar; lapisan status tipis di atas/bawah hanya muncul ketika relevan.
- **Signature Elements**: wordmark SIMKAR pada loading/error state, garis aksen teal, dan kontrol reload ringkas.
- **Interaction Philosophy**: satu tap untuk coba lagi/reload; kembali mengikuti ekspektasi Android; tautan asing tidak mengambil alih sesi aplikasi.
- **Animation**: spinner ringan saat halaman pertama dan navigasi; tanpa animasi dekoratif yang menghambat akses absen.
- **Typography System**: system sans-serif Android untuk shell; tipografi halaman utama tetap milik server SIMKAR.
- **Brand Essence**: akses presensi SIMKAR yang langsung dan tepercaya untuk karyawan; praktis, tegas, aman.
- **Brand Voice**: singkat dan membantu. Contoh: “Menghubungkan ke SIMKAR…” dan “Koneksi belum tersedia. Coba lagi.”
- **Wordmark & Logo**: gunakan aset logo SIMKAR yang sudah disertakan server sebagai ikon/splash tanpa menambahkan kredensial atau data pengguna.
- **Signature Brand Color**: teal SIMKAR `#0F766E`.

## Batasan dan asumsi

- Build Android native/release dilakukan melalui Dashboard/EAS setelah source siap; Sandbox tidak menjalankan release build Android.
- Pengujian Preview terhadap server sempat menunjukkan `HTTP 401 Unauthorized`, sedangkan probe TLS langsung dari Sandbox juga gagal pada percobaan lain; URL tetap dikonfigurasi sesuai permintaan pengguna, tetapi server/proxy perlu diperbaiki dan diverifikasi agar halaman login dapat diakses oleh aplikasi.
- Jika server kelak menyediakan API mobile resmi, shell ini dapat diganti bertahap tanpa mengubah alur launcher dan konfigurasi aplikasi.
