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
    Buildings.js
    About.js
    Trees.js
    Signs.js
    Markers.js
tests/
  controls.test.js             # Regresi kontrol, area, kamera, dan disposal
  browser.mjs                  # Regresi UI, HMR, resize, mobile, production
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

Nilai gerakan per frame, smoothing kamera, posisi objek, warna, material, animasi marker, isi portfolio, dan tampilan panel tetap mengikuti versi awal. Input direset saat window kehilangan fokus, diabaikan saat panel terbuka, dan shortcut berulang akibat tombol ditahan diabaikan.

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
- Production build: berhasil. Bundle utama sekitar 591 kB minified / 151 kB gzip; warning Vite untuk chunk di atas 500 kB tetap terlihat. Pemecahan bundle tidak dilakukan hanya untuk menyembunyikan warning karena Three.js tetap diperlukan saat startup.
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
