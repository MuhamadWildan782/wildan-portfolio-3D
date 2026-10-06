# Muhamad Wildan Portfolio

Portfolio interaktif menggunakan Vanilla JavaScript, Three.js, dan Vite. Tidak memakai framework UI.

## Menjalankan project

Gunakan Node.js 22.15+ (versi yang dipakai saat verifikasi: 22.15.0).

```sh
npm ci
npm run dev
npm run check
npm run preview
```

`check` menjalankan ESLint, pemeriksaan format Prettier, unit test Node.js, dan production build. `preview` menyajikan folder `dist` hasil build.

Tes browser menggunakan Playwright:

```sh
npx playwright install chromium
npm run test:browser
npm run test:world
```

Jika Microsoft Edge sudah terpasang, tidak perlu mengunduh Chromium. Pada PowerShell:

```powershell
$env:BROWSER_CHANNEL = 'msedge'
npm run test:browser
```

Tes browser membuat server lokal sendiri, menguji UI dan HMR, kemudian membangun dan menyajikan versi subfolder `/portfolio/`. Screenshot dan output sementara disimpan di `test-results/`, yang diabaikan Git.

## Struktur dan tanggung jawab

```text
src/
  main.js                     # Entry point dan cleanup saat Vite HMR
  style.css                   # Styling yang dipertahankan dari desain awal
  core/
    App.js                    # Lifecycle, satu resize handler, animation loop
    Camera.js                 # Camera follow dan projection resize
    Renderer.js               # Renderer, ukuran canvas, pixel ratio, disposal
  data/
    AboutData.js              # Profil, skill, dan highlights
    ProjectsData.js           # Semua tujuh project beserta kontribusinya
    InteractiveAreas.js       # ID, tipe, warna, anchor, offset, dan jarak
    Landscaping.js            # Posisi, skala, dan rotasi landscaping
  interaction/
    CarControls.js            # WASD, enable/disable, blur, cleanup keyboard
    Interaction.js            # Prompt dan shortcut E/X/Escape
    NearestArea.js            # Pencarian area terdekat
    PanelController.js        # State closed/list/detail/about dan navigasi
  ui/
    Elements.js               # Helper DOM dan pengisian header panel
    Panel.js                  # Elemen shell, visibility, listener close/backdrop
    ProjectList.js            # Rendering kartu project
    ProjectDetail.js          # Rendering detail dan tombol Back
    AboutPanel.js             # Rendering profil
  utils/
    DisposeScene.js           # Pelepasan geometry, material, texture, shadow
    Font.js                   # Satu promise font bersama, path mengikuti base Vite
    TextLabel.js              # Label 3D dengan opsi alignment/material
  world/
    World.js                  # Komposisi scene dan objek world
    InteractiveAreas.js       # Mengubah configuration menjadi posisi Three.js
    Car.js                    # Model mobil dan roda; tanpa keyboard listener
    Environment.js
    Entrance.js               # Gerbang identitas dengan satu canvas texture
    Landscaping.js            # Semak/batu instanced dan lamp post
    Buildings.js
    About.js
    Trees.js
    Signs.js
    Markers.js
tests/
  controls.test.js             # Regresi kontrol, area, kamera, dan disposal
  browser.mjs                  # Regresi UI, HMR, resize, mobile, production
  world.browser.mjs            # Footprint, jalur WASD, kamera, screenshot world
  three.js                     # Resolusi Three.js bersama untuk tes browser
```

Alur: `main → App → World/Camera/Renderer`, lalu `CarControls` menggerakkan model. `Interaction` mencari area dan meneruskan perintah ke `PanelController`. Controller memilih data dan renderer UI; renderer UI tidak membaca scene atau memasang listener global.

## Kontrol yang dipertahankan

- W/S: maju/mundur. A/D: belok ketika mobil bergerak.
- E: membuka konten area terdekat pada jarak kurang dari 3.5 unit.
- Marker mulai aktif pada jarak kurang dari 5 unit.
- Klik kartu: detail project. Back: kembali ke daftar.
- Escape dari detail: kembali ke daftar. Escape dari daftar/About: tutup panel.
- Tombol × dan backdrop: menutup panel langsung, termasuk dari detail.
- X pada keyboard: shortcut tutup langsung yang ditambahkan pada refactor.

Nilai gerakan per frame, smoothing kamera, posisi destination/marker, animasi marker, isi portfolio, dan tampilan panel tetap mengikuti versi awal. Input direset saat window kehilangan fokus, diabaikan saat panel terbuka, dan shortcut berulang akibat tombol ditahan diabaikan. Perubahan visual world dijelaskan di bawah.

## World visual polish

Posisi landscaping terpusat di `src/data/Landscaping.js`. Format pohon adalah `[x, z, scale, rotationY]`; semak/batu `[x, z, scale]`; lamp post `[x, z]`. Distribusi dibuat sebagai kelompok kecil di luar jalur berkendara, bukan penempatan acak.

- Pohon lama di `(-10, -8)` dan `(10, -8)` berada di footprint gedung. Susunan baru memakai sepuluh pohon di sisi luar/belakang destination, dengan variasi skala dan rotasi. Bounding box setiap instance diperiksa terhadap gedung, jalan, dan area marker.
- Sepuluh semak rendah, empat batu, dan dua lamp post menjadi aksen landscaping. Lamp post tidak menambahkan sumber cahaya dinamis. Pohon, semak, dan batu memakai empat `InstancedMesh`, sehingga geometry/material dipakai bersama.
- Jalan menggunakan satu `ShapeGeometry` untuk intersection, driveway kiri/kanan, dan plaza About yang bersegi. Trotoar diputus pada mulut intersection; garis jalan berhenti sebelum persimpangan dan marker. Lapisan road, shadow, dan markings mempunyai elevasi berbeda.
- Gerbang entrance di dekat spawn memuat nama, role, dan instruksi yang diminta. Papan berada di atas camera follow, tiangnya di luar trotoar, dan tulisan memakai satu canvas texture. Posisi ini menjaga keterbacaan pada desktop dan portrait tanpa mengubah kamera.
- Directional sign berbentuk panah memakai purple Odoo dan teal Backend. Label gedung terlihat dari jalan utama dan driveway. Label About putih di atas papan purple, dengan platform lebih kecil agar tidak memotong marker.
- Bayangan tipis menghubungkan objek dengan permukaan tanah. Tidak ada animasi dekorasi baru.
- Cleanup lama dipertahankan; `DisposeScene.js` juga memanggil disposal pada instanced mesh untuk membebaskan buffer instance.

File baru: `src/data/Landscaping.js`, `src/world/Entrance.js`, `src/world/Landscaping.js`, `tests/world.browser.mjs`, dan `tests/three.js`. File diubah: `Environment.js`, `Trees.js`, `Signs.js`, `Buildings.js`, `About.js`, `World.js`, `DisposeScene.js`, tes disposal, package scripts, dan README. Tidak ada file dihapus atau dependency ditambahkan pada tahap visual ini.

### Pemeriksaan visual dan performa

Jalankan `npm run test:world` dengan pilihan browser yang sama seperti tes UI. Tes mengemudikan mobil menggunakan W/A/D menuju ketiga destination, memeriksa clearance mobil/kamera, dan membuka panel memakai E. Tes UI terpisah mencakup Back/X/Escape/backdrop serta semua tujuh project.

Pada kamera awal 1280×800, Edge headless: 117 draw call sebelum dan sesudah polish. Triangle yang dirender turun dari 16.852 menjadi 14.220. Sepuluh pohon berbagi dua geometry dan dua material. Angka tersebut adalah statistik rendering pada satu komposisi, bukan jaminan FPS seluruh perangkat. Instancing dapat membuat lebih banyak instance tetap dirender ketika sebagian batch berada di luar layar.

Screenshot desktop, portrait 390×844, dan pendekatan ke tiga destination berada di `test-results/visual/`. Folder itu diabaikan Git. Jika salinan `test-results/before-polish/src/` masih tersedia, environment variable `COMPARE_BASELINE=1` mengaktifkan perbandingan statistik dengan salinan tersebut.

Validasi terakhir: lint, format, tujuh unit test, tes browser UI, tes world, dan production subfolder lulus. Tidak ada error console atau warning Three.js baru. Data tujuh project, AboutData, camera, mobil, marker, CSS panel, dan modul interaksi tidak diubah dalam tahap visual ini.

Polish lanjutan yang masih layak: uji ukuran tulisan pada laptop dengan resolusi kecil dan GPU fisik, serta evaluasi komposisi destination kiri/kanan pada layar portrait. Field of view kamera lama tetap digunakan, sehingga sisi world masih terpotong di layar sempit; gerbang entrance dan About berada di tengah. Kontrol touch tetap di luar lingkup perubahan ini.

## Hasil review dan perubahan

- Folder typo `src/interactionn/` dihapus setelah logikanya dipindahkan ke `src/interaction/`; tidak ada import ke path lama.
- `Interaction.js` yang sebelumnya mencampur UI, data, dan state panel dipecah menjadi modul di atas.
- Resize kamera ganda dihapus. App menjadi satu pemilik resize dan animation loop.
- Listener keyboard/panel, canvas, Timer, dan resource GPU dibersihkan ketika app dibuang atau diperbarui melalui HMR. Callback font tidak membuat mesh setelah scene dibuang.
- Input tidak lagi tersangkut saat blur, atau tersimpan ketika kontrol sedang dinonaktifkan.
- Pemuatan font pada Buildings, Signs, dan About disatukan. Path font memakai `import.meta.env.BASE_URL`; deployment subfolder sudah diuji.
- Aturan `.project-card` dan hover yang berulang digabung dengan mempertahankan nilai cascade terakhir. Tiga media query mobile digabung. Selector HTML/CSS/JS yang digunakan tetap konsisten.
- Teks dinamis memakai `textContent`, bukan interpolasi HTML. Data project dan About tidak dihapus.
- API Three.js diperiksa pada versi lokal 0.186.1. `PCFShadowMap`, `SRGBColorSpace`, `Timer`, dan `TextGeometry.depth` sudah sesuai. Tes browser tidak menemukan warning Three.js/deprecation.
- Request otomatis favicon yang menghasilkan 404 dinonaktifkan dengan favicon kosong pada HTML. Ganti dengan favicon personal sebelum publish.
- ESLint, Prettier, Playwright, scripts pemeriksaan, dan tes regresi ditambahkan sebagai tooling development. `source-map-js` diperbarui ke patch yang memperbaiki temuan audit.

Semua file lama dalam `src` dirapikan; perubahan pada `ProjectsData.js` dan `AboutData.js` hanya format. `index.html`, `package.json`, dan lockfile diperbarui. File baru: modul pemisahan yang tercantum di struktur, dua file tes, `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `.gitignore`, dan README ini. File yang dihapus: `src/interactionn/Interaction.js`.

## Verifikasi dan batasan

- ESLint dan format check: lulus.
- Unit test: tujuh tes lulus.
- Browser: seluruh tujuh project, Back, Escape, X, ×, backdrop, About, resize, overflow panel pada 390px, tiga siklus HMR, caching font, dan cleanup diuji.
- Production build setelah visual polish: berhasil. Bundle utama sekitar 602 kB minified / 155 kB gzip; warning Vite untuk chunk di atas 500 kB tetap terlihat. Pemecahan bundle tidak dilakukan hanya untuk menyembunyikan warning karena Three.js tetap diperlukan saat startup.
- Audit dependency setelah patch: nol kerentanan saat pemeriksaan.
- Browser yang diuji: Microsoft Edge headless di Windows. Belum diverifikasi di Safari atau perangkat mobile fisik. Screenshot hasil tes bukan perbandingan pixel otomatis dengan versi awal.

## Sebelum publish

1. Isi screenshot asli pada detail project; placeholder sengaja dipertahankan. Tambahkan tautan demo/repository dan kontak bila ingin ditampilkan.
2. Siapkan favicon personal, metadata description/Open Graph, dan gambar share. Asset `public/favicon.svg` dan `public/icons.svg` adalah asset template yang belum dipakai; bukan identitas portfolio baru.
3. Tentukan dukungan perangkat sentuh dan aksesibilitas: kontrol saat ini membutuhkan keyboard, kartu masih dioperasikan lewat klik, dan modal belum mempunyai focus trap. Perubahan UX tersebut tidak dimasukkan dalam refactor ini.
4. Uji performa GPU/perangkat fisik. Kecepatan mobil dan smoothing kamera masih berbasis frame, sesuai versi awal; perbedaan refresh rate masih dapat memengaruhi feel. Pertimbangkan delta-time sebagai perubahan behavior terpisah.
5. Tambahkan fallback jika WebGL tidak tersedia bila dibutuhkan untuk audiens target.
6. Atur base URL sesuai hosting. Untuk subfolder: `npm run build -- --base=/nama-folder/`. Deploy isi `dist/`; `vite preview` hanya untuk pemeriksaan lokal.
7. Inisialisasi repository Git jika belum ada, lalu simpan source, lockfile, dan tes. Jangan commit `node_modules`, `dist`, atau `test-results`.
