# Qur'an Space

Qur'an Space adalah kerangka website statis bertema belajar Islam yang dirancang untuk menampung banyak file materi HTML.

Website ini cocok untuk GitHub Pages, tanpa backend dan tanpa build step.

## Mulai Cepat

1. Simpan file materi HTML ke folder kategori di dalam `materi/`.
2. Tambahkan entri file tersebut ke `materi/manifest.json`.
3. Buka `index.html` melalui GitHub Pages atau server lokal.

## Struktur Folder

```text
.
├── .nojekyll
├── index.html
├── assets/
│   ├── css/style.css
│   └── js/main.js
└── materi/
    ├── manifest.json
    ├── al-quran/
    ├── hadits/
    ├── fiqih/
    ├── aqidah/
    ├── sirah/
    ├── akhlak/
    └── lainnya/
```

## Cara Kerja Daftar Materi Otomatis

Karena GitHub Pages adalah static hosting, browser tidak bisa membaca isi folder secara langsung.

Solusinya:
1. Semua daftar materi dicatat di `materi/manifest.json`.
2. `assets/js/main.js` melakukan fetch ke manifest tersebut.
3. Halaman `index.html` menampilkan materi secara otomatis, dikelompokkan berdasarkan kategori.

## Cara Menambahkan Materi Baru

1. Upload file HTML materi Anda ke sub-folder kategori yang sesuai di dalam `materi/`.
   - Contoh: `materi/fiqih/wudhu-dan-tayammum.html`
2. Tambahkan entri baru pada `materi/manifest.json`.
3. Commit perubahan ke branch `main`.

Contoh format entri manifest:

```json
{
  "judul": "Wudhu dan Tayammum",
  "kategori": "Fiqih",
  "path": "materi/fiqih/wudhu-dan-tayammum.html",
  "deskripsi": "Ringkasan hukum, rukun, sunnah, dan pembatal wudhu."
}
```

> Pastikan nilai `path` sesuai lokasi file HTML yang diupload.
> Gunakan path file lokal relatif dan akhiri dengan `.html`.

## Menjalankan Lokal

Karena ini website statis, Anda bisa langsung membuka `index.html` di browser.

Jika fetch manifest terblokir oleh kebijakan browser saat membuka file lokal (`file://`), jalankan server statis sederhana, misalnya:

```bash
python -m http.server 8080
```

Lalu buka `http://localhost:8080`.

## Aktivasi GitHub Pages

1. Buka repository di GitHub.
2. Masuk ke **Settings** → **Pages**.
3. Pada **Source**, pilih **Deploy from a branch**.
4. Pilih branch `main` dan folder `/ (root)`.
5. Simpan, lalu tunggu proses deploy selesai.

Setelah aktif, website Qur'an Space dapat diakses melalui URL GitHub Pages repository Anda.
