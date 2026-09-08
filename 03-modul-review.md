# Jakvent — 03. Modul Review (role Appraisal, Investasi, Legal, RM)

Lanjutkan project Jakvent dari file sebelumnya (01 & 02). Bangun modul "Review", menggantikan
halaman placeholder "/review". Modul ini dipakai oleh 4 role: Appraisal, Investasi, Legal, RM
— masing-masing hanya melihat & menindaklanjuti item checklist yang jadi tanggung jawabnya
(field reviewRole pada tiap item, sudah didefinisikan waktu membangun modul Pipeline).

## Rekap reviewRole per role
(harus konsisten dengan data yang sudah ada di store)
- rm → Inisiasi (semua item) + Hasil Kunjungan (semua item)
- appraisal → Aspek CPU (semua item) + Aspek Jaminan + Aspek Risiko (semua item)
- investasi → Ikhtisar Pembiayaan + seluruh Kuantitatif (Kinerja CPU Overall, Aspek Keuangan,
  Rekap PO/Invoice CPU, Aging Piutang CPU, Simulasi Skema Pembiayaan) + seluruh Revolving -
  Internal Memo
- legal → Aspek Bouwheer (semua item)

## Halaman List Review (route "/review")
- Tabel berisi SEMUA pipeline yang sudah diinput admin (ambil dari store yang sama dengan
  modul Pipeline — jadi kalau admin tambah pipeline baru, otomatis muncul di sini juga).
- Kolom: No., Code, Nama Entitas, Fasilitas, Batch, Tanggal, Jumlah Dokumen (hitung jumlah
  item yang reviewRole-nya = role yang sedang login), Status Review (hitung dari item-item
  scope role ybs saja: "Belum Direview" kalau semua masih null, "Sedang Berjalan" kalau
  sebagian sudah ada status, "Selesai" kalau semua item scope-nya sudah ada status), Aksi
  (tombol "Review").

## Halaman Detail Review (route "/review/:id")
- Tampilkan info ringkas Data Pipeline di atas (read-only: Code, Nama Entitas, Fasilitas,
  Batch, Tanggal).
- Render HANYA item-item checklist yang reviewRole-nya sesuai role yang sedang login (item
  milik role lain TIDAK ditampilkan di halaman ini).
- Untuk tiap item, tampilkan:
  - Label item
  - Preview/nama file yang diupload admin (kalau belum ada file, tampilkan "Belum ada file
    dari admin" dan disable aksi review untuk item itu)
  - Selector status: OK / Revisi / NO (pakai button group atau select, warna beda tiap
    pilihan — hijau/kuning/merah)
  - Textarea "Notes" (bisa diisi kapan saja selama proses review)
  - Field "Remarks" — hanya bisa diisi/terbuka SETELAH status item tsb dipilih (sebelum itu
    disabled dengan placeholder "Isi status dulu untuk menulis remarks")
- Card "Summary (Bobot)" di bagian bawah untuk konteks keseluruhan progress pipeline (termasuk
  bagian yang direview role lain), read-only.
- Tombol "Simpan Review" yang menyimpan semua perubahan status/notes/remarks ke store — dan
  ini harus otomatis mempengaruhi totalProgress & Summary (Bobot) yang tampil di modul
  Pipeline (karena shared state).

Untuk demo, isi minimal satu pipeline contoh dengan sebagian item RM/Appraisal/Investasi/Legal
sudah ada status & notes, supaya waktu login sebagai berbagai role, halaman Review langsung
kelihatan datanya.

Setelah modul ini selesai dan berjalan baik, lanjutkan ke 04-modul-dashboard.md.
