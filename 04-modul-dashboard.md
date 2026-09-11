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
- "Total Target Pipeline": Rp 20.900.000.000 (dari SUBTOTAL Target Pipelines)
- "Total Realisasi": Rp 3.697.430.580
- "Achievement (Deficit)": -Rp 17.202.569.420 (tandai warna merah karena negatif)
- "Sisa Saldo Kas (Realisasi)": Rp 12.100.000.000

### 2. Chart
Pakai recharts, membandingkan Target vs Realisasi per bulan untuk New Disbursement &
Revolving (bar chart grouped, atau line/area — pilih yang paling jelas menampilkan 4 angka:
Target New, Realisasi New, Target Revolving, Realisasi Revolving per bulan Oct/Nov/Dec).

### 3. Tabel "Target Pipelines"
(Entitas x Oct/Nov/Dec, tiap bulan ada 2 kolom New & Revolving, + Total, + baris SUBTOTAL
di akhir):

| Entitas | Okt New | Okt Revolving | Nov New | Nov Revolving | Des New | Des Revolving | Total |
|---|---|---|---|---|---|---|---|
| Ternakita | 1.100.000.000 | - | 2.200.000.000 | - | - | 1.100.000.000 | 4.400.000.000 |
| Invonex | 1.100.000.000 | - | 1.100.000.000 | - | - | - | 2.200.000.000 |
| Labmentari | - | - | 1.200.000 | - | 1.100.000.000 | - | 1.101.200.000 |
| Kerjabantu | - | - | 1.100.000.000 | - | - | 1.100.000.000 | 2.200.000.000 |
| Kudapan Rasa | - | - | 1.100.000.000 | - | - | - | 1.100.000.000 |
| Motorika Jaya | - | - | - | - | 1.100.000.000 | - | 1.100.000.000 |
| Merapi Wahana Sejahtera | - | - | - | - | - | - | 0 |
| Anak Tangga | - | - | 2.200.000 | - | - | - | 2.200.000 |
| Dompet Rukun | - | - | 550.000.000 | - | - | - | 550.000.000 |
| Gudang Rapi | - | - | - | - | - | - | 0 |
| Cahaya Fatura | - | 450.000.000 | - | 450.000.000 | - | 450.000.000 | 1.350.000.000 |
| Nusantara Piutang | - | 460.000.000 | - | 460.000.000 | - | - | 920.000.000 |
| Dana Fatura Prima | - | 1.050.000.000 | - | 1.050.000.000 | - | 2.100.000.000 | 4.200.000.000 |
| Palapa Lintas | - | - | - | 550.000.000 | - | - | 550.000.000 |
| Eltara | - | - | - | - | - | 550.000.000 | 550.000.000 |
| Tirtayasa | - | - | 1.100.000.000 | - | - | - | 1.100.000.000 |
| **SUBTOTAL** | 2.200.000.000 | 2.200.000.000 | 6.600.000.000 | 2.200.000.000 | 2.200.000.000 | 5.500.000.000 | 20.900.000.000 |

### 4. Tabel "Realisasi Pipelines"
(struktur sama):

| Entitas | Okt New | Okt Revolving | Nov New | Nov Revolving | Des New | Des Revolving | Total | Status |
|---|---|---|---|---|---|---|---|---|
| Ternakita | 1.150.000.000 | 725.000.000 | 0 | - | - | 0 | 1.875.000.000 | OK |
| Invonex | - | - | 0 | - | - | - | 0 | Deficit |
| Labmentari | - | - | 0 | - | - | - | 0 | - |
| Kerjabantu | - | - | 0 | - | - | 0 | 0 | - |
| Kudapan Rasa | - | - | 0 | - | - | - | 0 | - |
| Motorika Jaya | - | - | - | - | 0 | - | 0 | - |
| Merapi Wahana Sejahtera | - | - | - | - | - | - | 0 | - |
| Anak Tangga | - | - | 0 | - | - | - | 0 | - |
| Dompet Rukun | - | - | 0 | - | - | - | 0 | - |
| Gudang Rapi | - | - | - | - | - | - | 0 | - |
| Cahaya Fatura | - | 450.000.000 | - | 0 | - | 0 | 450.000.000 | - |
| Nusantara Piutang | - | 0 | - | 460.000.000 | - | - | 460.000.000 | - |
| Dana Fatura Prima | - | 912.430.580 | - | 0 | - | 0 | 912.430.580 | - |
| Palapa Lintas | - | - | - | 0 | - | - | 0 | - |
| Eltara | - | - | - | - | - | 0 | 0 | - |
| Tirtayasa | - | - | - | - | - | - | 0 | - |
| **TOTAL** | 1.150.000.000 | 2.087.430.580 | 0 | 460.000.000 | 0 | 0 | 3.697.430.580 | |

### 5. Tabel "Target vs Realisasi & Achievement"

| | Okt Target | Okt Realisasi | Nov Target | Nov Realisasi | Des Target | Des Realisasi |
|---|---|---|---|---|---|---|
| New Disbursement | 2.200.000.000 | 1.150.000.000 | 6.600.000.000 | 0 | 2.200.000.000 | 0 |
| Revolving | 2.200.000.000 | 2.087.430.580 | 2.200.000.000 | 460.000.000 | 5.500.000.000 | 0 |
| **SUBTOTAL** | 4.400.000.000 | 3.237.430.580 | 8.800.000.000 | 460.000.000 | 7.700.000.000 | 0 |
| **ACHIEVEMENT (Deficit)** | -1.162.569.420 | | -8.340.000.000 | | -7.700.000.000 | |

### 6. Tabel/section "Saldo Kas"

| Tanggal | Proyeksi | Realisasi |
|---|---|---|
| 22 Okt 2024 | 19.700.000.000 | 19.700.000.000 |
| 31 Okt 2024 | 17.600.000.000 | 17.600.000.000 |
| 30 Nov 2024 | 11.000.000.000 | 17.600.000.000 |
| 31 Des 2024 | 8.800.000.000 | 17.600.000.000 |
| Reserves | 5.500.000.000 | 5.500.000.000 |
| **Sisa Saldo Kas** | 3.300.000.000 | 12.100.000.000 |

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
