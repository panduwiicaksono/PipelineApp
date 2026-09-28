# Jakvent — 07. Koreksi Sistem Skor (Poin, bukan Persentase) & Pemisahan Scoring SLIK/APU PPT

Ini PATCH lanjutan di atas hasil file 06 yang sudah dieksekusi. Koreksi beberapa hal berikut
di codebase yang sudah ada — JANGAN scaffold ulang.

## Latar belakang masalah

Saat ini skor Likert × Bobot ditampilkan sebagai **persentase** (contoh: "Rata-rata Skor
(Likert x Bobot) 95%"), padahal seharusnya ditampilkan sebagai **poin** dari total 100 poin
(bukan %). "Progress (%)" yang sudah ada sebelumnya (berbasis kelengkapan status item)
TETAP seperti biasa, TIDAK berubah — yang berubah HANYA cara tampil & hitung metrik **Skor**,
supaya "Progress" dan "Skor" jadi dua metrik yang jelas berbeda satuannya di semua tempat
(Summary card, tabel Review, Dashboard).

## 1. Alokasi poin per item (total 100 poin)

Ganti "bobot %" pada tiap item checklist dengan **poin maksimal** berikut:

**Inisiasi — 30 poin total:**
| Item | Poin Maksimal |
|---|---|
| SLIK | 10 |
| APU PPT | 5 |
| Intro Meeting | 3 |
| NDA | 3 |
| Data | 3 |
| Onsite Visit | 3 |
| Call Report | 3 |

**Proposal Investasi — Kualitatif — 35 poin total:** bagi rata 35 poin ke seluruh 18 item di
dalamnya (Aspek CPU 5 item, Aspek Bouwheer 6 item, Hasil Kunjungan 3 item, Aspek Jaminan 1
item, Aspek Risiko 2 item, Ikhtisar Pembiayaan 1 item) → boleh dibulatkan 1 desimal per item.

**Proposal Investasi — Kuantitatif — 35 poin total:** bagi rata ke 7 item di dalamnya
(Kinerja CPU Overall, Neraca, Laba Rugi, Rasio Keuangan, Rekap PO/Invoice CPU, Aging
Piutang CPU, Simulasi Skema Pembiayaan) → 5 poin per item.

**Revolving — Internal Memo — 100 poin (kategori terpisah, seperti sebelumnya):** bagi rata
ke 5 item di dalamnya → 20 poin per item.

**Rumus skor per item:** `(Likert ÷ 5) × Poin Maksimal item`. Contoh: SLIK dapat Likert 4 →
(4/5) × 10 = 8 poin.

Tampilkan poin maksimal tiap item di sebelah label item, di manapun selector Likert
ditampilkan (contoh: "SLIK (maks. 10 poin)").

## 2. Ganti semua tampilan skor dari % ke format poin

Di Summary card (sebelumnya "Summary (Bobot)"):
- Baris **Progress** (Inisiasi/Proposal Investasi/Kualitatif/Kuantitatif/Revolving/Total
  Progress) TETAP tampil dalam %, TIDAK berubah.
- Baris **skor** (sebelumnya "Rata-rata Skor (Likert x Bobot) 95%") diganti jadi **"Total
  Skor: X dari 100 poin"** (atau breakdown per section kalau ingin, misal "Inisiasi: 24 dari
  30 poin"), dihitung dari penjumlahan skor semua item yang statusnya sudah ada (item yang
  belum discore dianggap 0 poin).

Terapkan perubahan format yang sama (poin, bukan %) di:
- KPI card "Rata-rata Skor" pada Dashboard (reviewer & Admin Investasi/Administrator)
- Kolom "Skor" pada tabel "Progress vs Skor per Pipeline" di Dashboard

## 3. Tambah kolom "Skor" di tabel Review (semua role)

Di halaman List Review (route "/review", untuk RM/Appraisal/Investasi/Legal), tambahkan
kolom baru **"Skor"** di tabel Daftar Pipeline, di sebelah kolom "Status Review". Formatnya
"X dari Y poin", di mana Y = total poin maksimal dari item-item yang jadi scope role
tersebut SAJA (bukan skor keseluruhan pipeline). Contoh: kolom Skor untuk role Legal cuma
menjumlahkan poin dari item-item Aspek Bouwheer.

## 4. Pisahkan scoring SLIK & APU PPT dari halaman input data

**Halaman Add New Pipeline & Detail Pipeline (Admin Investasi/Administrator):**
- HAPUS selector Likert 1-5 yang saat ini muncul langsung di bawah item SLIK dan APU PPT.
- Untuk kedua item ini, Admin Investasi HANYA mengisi data: Choose File (untuk APU PPT) dan
  form SLIK lengkap (form per-baris + fitur bulk paste dari Excel yang sudah ada, TIDAK
  berubah) untuk SLIK. TIDAK ADA input skor di halaman ini sama sekali untuk kedua item ini
  (sama seperti item checklist lainnya).

**Halaman Pipeline List / "Daftar Pipeline" (Admin Investasi/Administrator):**
- Tambahkan tombol baru **"Review"** di kolom Aksi, di samping tombol yang sudah ada (Lihat
  Detail, Release, Export) — khusus untuk role Admin Investasi/Administrator.
- Tombol ini mengarah ke halaman baru (misal route "/pipeline/:id/review-fase1") yang
  strukturnya SAMA seperti halaman Review Detail milik role lain: tampilkan HANYA 2 item
  (SLIK dan APU PPT), masing-masing dengan preview nama file yang sudah diupload, selector
  Likert 1-5 (dengan keterangan poin maksimal di sebelahnya), textarea Notes, field Remarks
  (terbuka setelah status diisi). Tambahkan juga tombol "Simpan Review" yang menyimpan skor
  ke item-item tsb — begitu tersimpan, Fase 1 gate otomatis terhitung ulang (skor gabungan
  SLIK+APU PPT dari maksimal 15 poin; lolos kalau ≥ 10,5 poin DAN tidak ada Likert=1 di
  keduanya), yang akan membuka/mengunci akses Review untuk role lain seperti logic yang
  sudah ada di file 06.
- Tambahkan juga kolom **"Skor"** di tabel Daftar Pipeline ini (Admin Investasi), format "X
  dari 15 poin" — menunjukkan skor SLIK+APU PPT saja (scope review milik Admin Investasi).

Setelah selesai, ringkas perubahan yang dilakukan dan konfirmasi format tampilan skor
sekarang sudah dalam bentuk poin (bukan %) di semua tempat yang disebutkan di atas.
