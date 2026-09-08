# Jakvent — 04. Modul Dashboard (Admin & 4 role reviewer)

Lanjutkan project Jakvent dari file sebelumnya (01, 02, 03). Bangun modul "Dashboard",
menggantikan halaman placeholder "/dashboard". Kontennya BEDA tergantung role yang login.

## Dashboard Admin
Ini harus MEREPLIKASI PERSIS struktur & data dari sheet "Pipelines" pada file Excel sumber
(Target Pipelines, Realisasi Pipelines, Achievement/Deficit, Saldo Kas). Style mengikuti
design system (KPI card berwarna, chart, tabel) — TIDAK PERLU filter periode, tampilkan
apa adanya seperti data di bawah ini.

### 1. KPI cards di atas
(4 card, gaya campuran dark/mint/pink/putih seperti di design system):
- "Total Target Pipeline": Rp 19.000.000.000 (dari SUBTOTAL Target Pipelines)
- "Total Realisasi": Rp 3.767.759.695
- "Achievement (Deficit)": -Rp 15.232.240.305 (tandai warna merah karena negatif)
- "Sisa Saldo Kas (Realisasi)": Rp 11.000.000.000

### 2. Chart
Pakai recharts, membandingkan Target vs Realisasi per bulan untuk New Disbursement &
Revolving (bar chart grouped, atau line/area — pilih yang paling jelas menampilkan 4 angka:
Target New, Realisasi New, Target Revolving, Realisasi Revolving per bulan Oct/Nov/Dec).

### 3. Tabel "Target Pipelines"
(Entitas x Oct/Nov/Dec, tiap bulan ada 2 kolom New & Revolving, + Total, + baris SUBTOTAL
di akhir):

| Entitas | Okt New | Okt Revolving | Nov New | Nov Revolving | Des New | Des Revolving | Total |
|---|---|---|---|---|---|---|---|
| BroilerX | 1.000.000.000 | - | 2.000.000.000 | - | - | 1.000.000.000 | 4.000.000.000 |
| ACML | 1.000.000.000 | - | 1.000.000.000 | - | - | - | 2.000.000.000 |
| Kinglab | - | - | 1.000.000 | - | 1.000.000.000 | - | 1.000.000.000 |
| MyRobin | - | - | 1.000.000.000 | - | - | 1.000.000.000 | 2.000.000.000 |
| Snackzone | - | - | 1.000.000.000 | - | - | - | 1.000.000.000 |
| Matador Lectro | - | - | - | - | 1.000.000.000 | - | 1.000.000.000 |
| Merpati Wahana Raya | - | - | - | - | - | - | 0 |
| Tangga | - | - | 2.000.000 | - | - | - | 0 |
| Arkopay | - | - | 500.000.000 | - | - | - | 0 |
| BGR | - | - | - | - | - | - | 0 |
| Yoona | - | 500.000.000 | - | 500.000.000 | - | 500.000.000 | 1.500.000.000 |
| Rakamin | - | 500.000.000 | - | 500.000.000 | - | - | 1.000.000.000 |
| ACMD | - | 1.000.000.000 | - | 1.000.000.000 | - | 2.000.000.000 | 4.000.000.000 |
| Pamelindo | - | - | - | 500.000.000 | - | - | 0 |
| Eshan | - | - | - | - | - | 500.000.000 | 500.000.000 |
| Taitat | - | - | 1.000.000.000 | - | - | - | 1.000.000.000 |
| **SUBTOTAL** | 2.000.000.000 | 2.000.000.000 | 6.000.000.000 | 2.000.000.000 | 2.000.000.000 | 5.000.000.000 | 19.000.000.000 |

### 4. Tabel "Realisasi Pipelines"
(struktur sama):

| Entitas | Okt New | Okt Revolving | Nov New | Nov Revolving | Des New | Des Revolving | Total | Status |
|---|---|---|---|---|---|---|---|---|
| BroilerX | 1.088.000.000 | 682.000.000 | 0 | - | - | 0 | 1.770.000.000 | OK |
| ACML | - | - | 0 | - | - | - | 0 | Deficit |
| Kinglab | - | - | 0 | - | - | - | 0 | - |
| MyRobin | - | - | 0 | - | - | 0 | 0 | - |
| Snackzone | - | - | 0 | - | - | - | 0 | - |
| Matador Lectro | - | - | - | - | 0 | - | 0 | - |
| Merpati Wahana Raya | - | - | - | - | - | - | 0 | - |
| Tangga | - | - | 0 | - | - | - | 0 | - |
| Arkopay | - | - | 0 | - | - | - | 0 | - |
| BGR | - | - | - | - | - | - | 0 | - |
| Yoona | - | 500.000.000 | - | 0 | - | 0 | 500.000.000 | - |
| Rakamin | - | 0 | - | 500.000.000 | - | - | 500.000.000 | - |
| ACMD | - | 997.759.695 | - | 0 | - | 0 | 997.759.695 | - |
| Pamelindo | - | - | - | 0 | - | - | 0 | - |
| Eshan | - | - | - | - | - | 0 | 0 | - |
| Taitat | - | - | - | - | - | - | 0 | - |
| **TOTAL** | 1.088.000.000 | 2.179.759.695 | 0 | 500.000.000 | 0 | 0 | 3.767.759.695 | |

### 5. Tabel "Target vs Realisasi & Achievement"

| | Okt Target | Okt Realisasi | Nov Target | Nov Realisasi | Des Target | Des Realisasi |
|---|---|---|---|---|---|---|
| New Disbursement | 2.000.000.000 | 1.088.000.000 | 6.000.000.000 | 0 | 2.000.000.000 | 0 |
| Revolving | 2.000.000.000 | 2.179.759.695 | 2.000.000.000 | 500.000.000 | 5.000.000.000 | 0 |
| **SUBTOTAL** | 4.000.000.000 | 3.267.759.695 | 8.732.240.305 | 500.000.000 | 15.232.240.305 | 0 |
| **ACHIEVEMENT (Deficit)** | -732.240.305 | | -8.232.240.305 | | -15.232.240.305 | |

### 6. Tabel/section "Saldo Kas"

| Tanggal | Proyeksi | Realisasi |
|---|---|---|
| 22 Okt 2024 | 17.900.000.000 | 17.900.000.000 |
| 31 Okt 2024 | 16.000.000.000 | 16.000.000.000 |
| 30 Nov 2024 | 10.000.000.000 | 16.000.000.000 |
| 31 Des 2024 | 8.000.000.000 | 16.000.000.000 |
| Reserves | 5.000.000.000 | 5.000.000.000 |
| **Sisa Saldo Kas** | 3.000.000.000 | 11.000.000.000 |

Format semua angka Rupiah dengan pemisah ribuan titik (format Indonesia).

## Dashboard Appraisal / Investasi / Legal / RM
Strukturnya SERAGAM untuk keempat role ini (bedanya cuma angka, dihitung dari data pipeline
yang scope-nya sesuai reviewRole role yang login). Cukup 5 KPI card, TANPA chart/tabel
tambahan:
1. Total Pipeline — jumlah semua pipeline yang ada
2. Pipeline Sudah Direview — jumlah pipeline yang SEMUA item scope role ybs sudah ada status
3. Pipeline Belum Direview — jumlah pipeline yang item scope role ybs masih ada yang null
4. Dokumen Menunggu Review — total item (across semua pipeline) di scope role ybs yang masih
   null
5. Dokumen Sudah Direview — total item di scope role ybs yang statusnya sudah OK/Revisi/NO

Style KPI card mengikuti design system yang sudah dibuat di file 01 (variasi warna
dark/mint/pink/putih, icon badge, angka besar).

Setelah modul ini selesai dan berjalan baik, lanjutkan ke 05-modul-realisasi.md.
