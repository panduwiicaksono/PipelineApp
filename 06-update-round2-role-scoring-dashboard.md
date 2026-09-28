# Jakvent — 06. Update Round 2 (Role Restructure, Scoring, Dashboard, Activity Log)

Ini adalah PATCH/UPDATE ke project Jakvent yang sudah ada (hasil file 01–05). Terapkan
perubahan berikut ke codebase yang sudah berjalan, JANGAN rebuild dari nol.

> **Catatan penting**: beberapa bagian di bawah ini ditandai **"ASUMSI SEMENTARA"** — ini
> tebakan masuk akal untuk kebutuhan mockup/demo SEKARANG, BUKAN standar final sistem.
> Tandai jelas di comment kode kalau memungkinkan, supaya gampang diganti begitu ada
> jawaban resmi dari client.

## 0. Koreksi label role RM

Role "RM" yang sudah ada di sistem (login dropdown, sidebar, label role di topbar, dsb)
sebelumnya salah label sebagai "Relationship Manager" — perbaiki jadi **"Risk Management"**
di SEMUA tempat yang menampilkan kepanjangan role ini. Tidak ada perubahan pada scope/aspek
yang direview RM (tetap Inisiasi + Hasil Kunjungan sesuai sebelumnya), murni koreksi nama.

## 1. Role restructure: Admin Investasi & Administrator

Role "Admin" lama dipecah jadi 2 pilihan di halaman Login: **Admin Investasi** dan
**Administrator**. KEDUANYA punya sidebar & halaman yang PERSIS SAMA (secara fungsi tidak
ada beda sama sekali — bedanya cuma nanti di real-world Administrator dipakai developer/IT,
Admin Investasi dipakai user asli — tapi ini tidak perlu direfleksikan di UI).

Sidebar untuk Admin Investasi & Administrator (ganti sidebar admin lama):
- Dashboard
- Pipeline
- Portofolio
- Input Realisasi
- Activity Log

Role appraisal/investasi/legal/rm TIDAK berubah sidebar-nya (tetap Dashboard, Review).

## 2. Rename & reposisi menu (isi & logic TIDAK berubah, cuma rename + pindah)

- Menu **"Portofolio"**: isinya PERSIS SAMA dengan Dashboard Admin yang sudah ada sekarang
  (tabel Target Pipelines, Realisasi Pipelines, Target vs Realisasi & Achievement, Saldo
  Kas). Pindahkan konten ini ke route "/portofolio", akses dari menu "Portofolio".
- Menu **"Input Realisasi"**: isinya PERSIS SAMA dengan modul Realisasi yang sudah ada
  (List pipeline yang released + Input Pencairan). Pindahkan ke route "/input-realisasi",
  akses dari menu "Input Realisasi".
- Route "/dashboard" untuk Admin Investasi/Administrator sekarang akan diisi KONTEN BARU
  (lihat poin 3 di bawah), BUKAN lagi berisi Target/Realisasi Pipelines seperti sebelumnya.

## 3. Dashboard baru untuk Admin Investasi & Administrator

Ganti total konten "/dashboard" khusus role Admin Investasi & Administrator (dashboard role
lain TIDAK berubah dulu di sini, lihat poin 6 untuk update dashboard reviewer):

- **KPI cards** (6 card total): 5 KPI yang sama seperti dashboard reviewer (Total Pipeline,
  Pipeline Sudah Direview, Pipeline Belum Direview, Dokumen Menunggu Review, Dokumen Sudah
  Direview — dihitung dari SEMUA pipeline, bukan scope tertentu) + 1 KPI baru **"Rata-rata
  Skor"** (rata-rata skor tertimbang dari seluruh pipeline yang ada, lihat poin 8 untuk
  cara hitung skor).
- **Tabel "Pipeline Jatuh Tempo Terdekat"**: list pipeline diurutkan berdasarkan Due Date
  (field baru, lihat di bawah) dari yang paling dekat, tampilkan 10 pipeline teratas.
  Kolom: Code, Nama Entitas, Due Date, Progress (%), Skor, Aksi (tombol "Lihat Detail").
- **Tabel "Progress vs Skor per Pipeline"**: semua pipeline dengan kolom Code, Nama Entitas,
  Progress (%), Skor, Status — supaya kelihatan pipeline mana yang progress jalan tapi
  skornya rendah (atau sebaliknya).

**Field baru "Due Date"**: tambahkan ke Data Pipeline (form Add New Pipeline, section
"Data Pipeline") — text input date picker, taruh setelah field Tanggal.

## 4. Detail Pipeline: 2 section baru

Tambahkan ke halaman Detail Pipeline yang sudah ada (setelah Summary Bobot, sebelum Aksi):

- **Section "Asset Under Management"**: list aset yang dijadikan jaminan pembiayaan. Data
  DUMMY saja — beberapa pipeline contoh punya beberapa aset (misal: "Tanah & Bangunan —
  Sertifikat SHM", "Kendaraan — BPKB Truk", "Mesin Produksi — Invoice Pembelian"), beberapa
  pipeline contoh TIDAK punya aset sama sekali (tampilkan "Belum ada aset yang dijaminkan").
  Cukup nama aset + jenis dokumen contoh saja, TIDAK perlu form terstruktur lengkap
  (nilai taksiran dll) — **ASUMSI SEMENTARA**, field lengkapnya menyusul.
- **Section "Activity Log"**: list log aktivitas KHUSUS pipeline ini. Data dummy, misal:
  "Admin Investasi mengupload dokumen SLIK — 2 hari lalu", "RM menandai status Notes pada
  item Call Report — 1 hari lalu", dst. Format: aktor, aksi, timestamp relatif.

## 5. Checklist baru: APU PPT

Tambahkan item **"APU PPT"** di bawah section Inisiasi (sejajar dengan Intro Meeting, NDA,
SLIK, Data, Onsite Visit, Call Report).

## 6. Sistem Skor (Likert × Bobot) — ASUMSI SEMENTARA

Ganti mekanisme status manual (OK/Revisi/NO) yang dipilih reviewer di halaman Review dengan
**skor Likert 1-5**:
- 1 = Sangat Kurang, 2 = Kurang, 3 = Cukup, 4 = Baik, 5 = Sangat Baik
- Skor tertimbang item = (nilai Likert ÷ 5) × bobot item
- Derivasi status dari Likert (supaya logic lama tetap kompatibel): 1-2 → status "NO",
  3 → status "Revisi", 4-5 → status "OK"
- "Nilai merah" = skor Likert 1 pada item SLIK atau APU PPT
- UI di halaman Review: ganti tombol OK/Revisi/NO dengan selector Likert 1-5 (misal 5 tombol
  radio dengan label singkat), status badge di tabel tetap tampilkan hasil derivasinya
  (OK/Revisi/NO) supaya konsisten dengan tampilan yang sudah ada
- Tambahkan KPI "Rata-rata Skor" ke SEMUA dashboard yang menampilkan progress (dashboard
  reviewer di poin 6 bawah, dan dashboard Admin Investasi/Administrator di poin 3)

## 7. Fase 1: SLIK & APU PPT dinilai LANGSUNG oleh Admin Investasi (bukan lewat Review)

Ini pengecualian khusus dari aturan umum "Admin tidak menentukan progress":

- Di halaman Add New Pipeline & Detail Pipeline (milik Admin Investasi/Administrator),
  KHUSUS untuk item **SLIK** dan **APU PPT**: selain "Choose File", tampilkan JUGA selector
  skor Likert 1-5 yang BISA diisi langsung oleh Admin Investasi/Administrator saat itu juga
  (tidak menunggu role lain). Semua item checklist LAINNYA tetap seperti sebelumnya: cuma
  Choose File, tidak ada input skor untuk Admin.
- **Fase 1 gate**: hitung skor tertimbang gabungan SLIK + APU PPT. Kalau skor ≥ 70% (ASUMSI
  SEMENTARA) DAN tidak ada nilai merah (skor Likert 1 di salah satu keduanya) → Fase 1
  dianggap LOLOS.
- **Kalau Fase 1 BELUM lolos**: pipeline ini di halaman Review (untuk role RM, Appraisal,
  Investasi, Legal) tampil TERKUNCI — tombol "Review" di List Review disabled, dengan
  tooltip/keterangan "Menunggu Fase 1 (SLIK & APU PPT) memenuhi syarat skor minimum".
- **Kalau Fase 1 SUDAH lolos**: role-role lain bisa mulai review seperti biasa (RM review
  sisa item Inisiasi yaitu Intro Meeting/NDA/Data/Onsite Visit/Call Report + Hasil
  Kunjungan; Appraisal/Investasi/Legal review scope masing-masing seperti sebelumnya — SLIK
  & APU PPT TIDAK muncul lagi di halaman Review manapun karena sudah dinilai Admin
  Investasi/Administrator sendiri).

## 8. SLIK: form terstruktur + bulk paste dari Excel — ASUMSI SEMENTARA

Karena SLIK sekarang dinilai Admin Investasi langsung (bukan lewat Review), taruh fitur ini
di halaman Add New/Detail Pipeline, di bagian item SLIK (selain Choose File & skor Likert
di atas):

- Field per baris (satu debitur bisa punya banyak baris/fasilitas dari berbagai bank):
  Nama Bank/Lembaga Pemberi (text), Jenis Fasilitas (text), Plafond (number/currency), Baki
  Debet/Outstanding (number/currency), Kolektibilitas (dropdown: Lancar, Dalam Perhatian
  Khusus, Kurang Lancar, Diragukan, Macet), Tanggal Data (date).
- Tombol "+ Tambah Baris" untuk menambah baris manual satu-satu.
- Fitur bulk paste: textarea "Paste dari Excel di sini" — user copy beberapa baris dari
  Excel (tab-separated, urutan kolom sama seperti field di atas) dan paste ke textarea ini.
  Sistem parse per baris (split by newline) dan per kolom (split by tab) → tampilkan sebagai
  tabel preview yang masih bisa diedit manual sebelum konfirmasi → tombol "Import" untuk
  memasukkan semua baris preview ke form SLIK sekaligus (replace atau append ke baris yang
  sudah ada, boleh append saja untuk sederhananya).

## 9. Notifikasi dummy

Tambahkan dropdown notifikasi yang muncul saat klik **icon lonceng/badge notifikasi** yang
sudah ada di topbar (BUKAN di avatar profile). Isi dropdown: list beberapa notifikasi dummy,
misal "Pipeline BroilerX sudah lolos Fase 1, Anda bisa mulai review", "Pipeline Rakamin
di-release oleh Admin Investasi", dengan timestamp relatif. Badge angka di icon lonceng
menunjukkan jumlah notifikasi belum dibaca (dummy juga).

## 10. Activity Log — menu baru (global)

Tambahkan halaman baru di route "/activity-log", muncul di sidebar Admin Investasi &
Administrator saja. Isinya: tabel log semua aktivitas di sistem (dummy), kolom: Waktu,
Aktor (nama + role), Aksi, Pipeline Terkait (kalau relevan). Contoh baris dummy: "25 Sep
2026 10:15 — RM — Menilai item Call Report (Revisi) — Pipeline BroilerX", "25 Sep 2026 09:00
— Admin Investasi — Menambahkan pipeline baru — Pipeline Yoona", dst. Minimal 10-15 baris
dummy dengan variasi aktor & aksi.

Setelah semua poin di atas diterapkan, berikan ringkasan singkat perubahan yang sudah
dilakukan dan bagian mana saja yang masih pakai ASUMSI SEMENTARA (supaya gampang di-review).
