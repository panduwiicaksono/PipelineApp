# Jakvent — 02. Modul Pipeline (khusus role Admin)

Lanjutkan project Jakvent yang sudah ada dari file sebelumnya (01-setup-login-layout.md).
Sekarang bangun modul "Pipeline" secara lengkap, khusus untuk role admin, menggantikan
halaman placeholder "/pipeline".

## Data model
Tambahkan ke zustand store, shared, dipakai juga oleh modul Review & Dashboard.

Setiap Pipeline punya struktur:
- Data Pipeline: nomor (auto increment, readonly), code (text, manual), tanggal (date),
  namaEntitas (text), keterangan (text), fasilitas (text), batch (text)
- totalProgress: number (0-100, dihitung dari checklist di bawah)
- status: 'Berjalan' | 'Siap Release' | 'Released'
  ('Siap Release' kalau totalProgress >= 90 dan belum di-release; 'Released' setelah tombol
  Release diklik)
- Checklist items, dikelompokkan per section, tiap item punya:
  { id, label, fileName?: string, status: 'OK' | 'Revisi' | 'NO' | null, notes?: string,
    remarksLocked: boolean, remarks?: string, reviewRole: 'rm' | 'appraisal' | 'investasi' | 'legal' }
  (reviewRole dipakai di modul Review nanti untuk filter item per role)

## Struktur lengkap checklist (bobot progress mengikuti ini)

1. Inisiasi — bobot 30% dari total, reviewRole: rm
   - Intro Meeting, NDA, SLIK, Data, Onsite Visit, Call Report

2. Proposal Investasi — bobot 70% dari total, terbagi:
   2a. Kualitatif (50% dari 70%)
       - Aspek CPU (reviewRole: appraisal): Profil, Pasar/Market, Produk Jasa/Barang,
         Tim/Manajemen, SLIK
       - Aspek Bouwheer (reviewRole: legal): Profil, Reputasi, Track-Record Kerjasama,
         Kontrak Payung/SPK, Alur/Skema Kerjasama dengan CPU, PIC Bouwheer - Konfirmasi
       - Hasil Kunjungan (reviewRole: rm): Kunjungan & Komunikasi CPU, Kunjungan &
         Komunikasi Bouwheer, OR Validasi Sistem Online Bouwheer
       - Aspek Jaminan (reviewRole: appraisal) — single item
       - Aspek Risiko (reviewRole: appraisal): Risiko Yang Timbul, Mitigasi Risiko
       - Ikhtisar Pembiayaan (reviewRole: investasi) — single item
   2b. Kuantitatif (50% dari 70%) — semua reviewRole: investasi
       - Kinerja CPU (Overall)
       - Aspek Keuangan: Neraca/Balance Sheet, Laba Rugi/Profit & Loss, Rasio Keuangan
       - Rekap PO/Invoice CPU (Historis)
       - Aging Piutang CPU
       - Simulasi Skema Pembiayaan

3. Revolving — Internal Memo — bobot 100% (kategori terpisah, mengikuti sheet aslinya),
   semua reviewRole: investasi
   - Historis Pembiayaan PU, Kinerja PU (Overall), Detil PO/Invoice PU, Konfirmasi Bouwheer,
     Simulasi Skema Pembiayaan

Progress tiap item dianggap 100% terpenuhi HANYA kalau status = 'OK'. totalProgress dihitung
dari rata-rata tertimbang (weighted average) sesuai bobot section di atas.

## Halaman List Pipeline (route "/pipeline")
- Tabel dengan kolom: No., Code, Nama Entitas, Keterangan, Fasilitas, Batch, Tanggal,
  Total Progress (tampilkan progress bar + persentase), Status (badge warna beda tiap status),
  Aksi.
- Kolom Aksi berisi: tombol "Lihat Detail" (selalu aktif), tombol "Release" (disabled kalau
  totalProgress < 90 atau status sudah 'Released'), tombol "Export" (disabled kecuali SEMUA
  item checklist sudah punya status apapun — OK/Revisi/NO, tidak harus semua OK).
- Tombol "+ Tambah Pipeline" di kanan atas, mengarah ke "/pipeline/new".
- Isi dengan minimal 6-8 data contoh, pakai nama entitas ini (konsisten dengan data
  perusahaan yang nanti dipakai di Dashboard): BroilerX, ACML, Kinglab, MyRobin, Yoona,
  Rakamin, ACMD, Snackzone. Variasikan totalProgress (ada yang 0%, ~45%, ~92%, 100%) supaya
  kelihatan behavior tombol Release/Export yang enabled/disabled.

## Halaman Add New (route "/pipeline/new")
- Section "Data Pipeline" di atas: text input untuk Code, Tanggal (date picker), Nama Entitas,
  Keterangan, Fasilitas, Batch. Nomor tampil readonly (auto, misal "Akan digenerate otomatis").
- Di bawahnya render SEMUA section & item checklist di atas. Untuk tiap item, tampilkan:
  - Label item
  - Tombol/komponen "Choose File" (input file, tampilkan nama file setelah dipilih) — INI
    SATU-SATUNYA cara admin mengisi item.
  - Kolom Progress/Notes/Remarks tampil READ-ONLY / disabled (misal placeholder "—", "Menunggu
    Review") karena admin TIDAK berhak mengisi ini — itu wilayah reviewer di modul Review.
- Card "Summary (Bobot)" di bagian bawah (sebelum tombol Simpan), tampilkan breakdown:
  Inisiasi (bobot 30%), Proposal Investasi (bobot 70%, sub: Kualitatif 50%, Kuantitatif 50%),
  Revolving (bobot 100%), dan Total Progress — semua mulai dari 0% karena baru dibuat.
- Tombol "Simpan" menambahkan pipeline baru ke store dan kembali ke "/pipeline".

## Halaman Detail Pipeline (route "/pipeline/:id", untuk pipeline yang SUDAH ADA)
- SEMUA field read-only: Data Pipeline, semua item checklist dengan status/notes/remarks
  hasil review (kalau ada data reviewnya — untuk demo, buat 1-2 contoh pipeline yang beberapa
  itemnya sudah punya status OK/Revisi/notes, biar halaman ini kelihatan terisi).
- Card "Summary (Bobot)" (sama seperti di Add New, tapi angkanya sudah terhitung dari data
  aktual).
- Section "Aksi" di bagian bawah, isinya:
  - Tombol "Revisi File" di tiap item (untuk ganti file yang sudah diupload admin)
  - Tombol "Release" (enabled kalau totalProgress >= 90 dan belum released). Klik → ubah
    status pipeline jadi 'Released', tampilkan konfirmasi/toast.
  - Tombol "Export" (enabled kalau semua item sudah ada statusnya). Klik → tampilkan
    dialog/toast: "Export ke dokumen ringkasan review — fitur ini akan terhubung ke
    template & backend di tahap berikutnya" (placeholder saja, belum generate file
    sungguhan).

Karena belum ada backend: file upload cukup simpan nama file (fileName) di state, tidak perlu
upload sungguhan ke server manapun.

Setelah modul ini selesai dan berjalan baik, lanjutkan ke 03-modul-review.md.
