# Jakvent — 05. Modul Realisasi (khusus Admin)

Lanjutkan project Jakvent dari file sebelumnya (01, 02, 03, 04). Bangun modul "Realisasi",
menggantikan halaman placeholder "/realisasi". Khusus role admin.

## Data model tambahan
Tiap pipeline yang statusnya sudah 'Released' punya data pencairan (disbursement), disimpan
per bulan x tipe (New/Revolving), dan tiap sel BISA berisi LEBIH DARI SATU entri pencairan
(bukan cuma satu angka). Struktur:

```
disbursements: {
  [bulan: string]: {   // contoh: "Oktober", "September", "November", dst — bebas nambah bulan
    new: Array<{ id, nominal: number, fileName?: string }>,
    revolving: Array<{ id, nominal: number, fileName?: string }>
  }
}
```

## Halaman List Realisasi (route "/realisasi")
- Tabel HANYA menampilkan pipeline yang status = 'Released' (ambil dari store yang sama
  dengan modul Pipeline).
- Kolom: No., Code, Nama Entitas, Fasilitas, Batch, Total Progress, Aksi (tombol "Input
  Pencairan").
- Kalau belum ada pipeline yang released, tampilkan empty state yang jelas ("Belum ada
  pipeline yang di-release untuk realisasi").

## Halaman Input Pencairan (route "/realisasi/:id")
- Tampilkan info ringkas pipeline di atas (read-only): Code, Nama Entitas, Fasilitas, Batch.
- Di bawahnya, tabel/grid dengan baris = bulan (mulai dengan beberapa bulan contoh: September,
  Oktober, November — beri tombol "+ Tambah Bulan" untuk menambah baris bulan baru), dan
  untuk tiap bulan ada 2 kolom: "New" dan "Revolving".
- Di tiap sel (bulan x New/Revolving), tampilkan LIST entri pencairan yang sudah ada (nominal
  + nama file), dan tombol "+ Tambah Pencairan" yang menambah baris input baru di sel itu
  berisi: input Nominal (number, format Rupiah) + "Choose File" untuk file pendukung. Beri
  juga tombol hapus (trash icon) di tiap entri untuk menghapusnya.
- Contoh skenario yang harus bisa ditangani UI ini: satu client dapat pencairan 3x di bulan
  berbeda (September, Oktober, November) — masing-masing entri dengan nominal & file sendiri,
  DAN juga bisa lebih dari satu entri dalam bulan & tipe yang sama (misal 2x pencairan New di
  bulan yang sama).
- Total per bulan per tipe dihitung otomatis (jumlah dari semua entri di sel itu), dan total
  keseluruhan pipeline itu ditampilkan di bagian bawah.
- Tombol "Simpan" menyimpan data ke store.

## Integrasi dengan Dashboard Admin
Total pencairan (New & Revolving) yang sudah diinput di sini HARUS ikut mempengaruhi angka
di tabel "Realisasi Pipelines" dan section "Target vs Realisasi & Achievement" pada Dashboard
Admin (file 04) — jadi kalau admin input pencairan baru di sini, angka di Dashboard ikut
berubah (karena shared state di zustand).

Karena belum ada backend, file pendukung cukup simpan nama file di state, tidak perlu upload
sungguhan.

Ini adalah modul terakhir. Setelah selesai, berikan ringkasan singkat seluruh fitur yang
sudah dibangun dari file 01 sampai 05.
