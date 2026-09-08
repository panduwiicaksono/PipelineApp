# Jakvent — 01. Setup, Design System, Login & Layout

> Catatan asumsi (untuk konteks, boleh diabaikan implementasinya kalau tidak relevan):
> field "Nomor" pada Data Pipeline auto-generate & read-only; field "Data" yang muncul di
> sheet Excel sumber (di sebelah Code) tidak diimplementasikan karena tampaknya hasil
> formula Excel, bukan input manual.

Buatkan project React + Vite + TypeScript untuk aplikasi bernama "Jakvent" — modul internal
untuk mengelola pipeline pembiayaan. Ini FRONTEND-ONLY (belum ada backend), semua data
disimpan di state management client-side (pakai zustand) supaya bisa dipakai bersama antar
halaman/modul yang akan dibangun bertahap setelah ini.

## Tech stack
- React 18 + Vite + TypeScript
- Tailwind CSS
- shadcn/ui untuk komponen dasar (button, input, card, table, dialog, badge, select, textarea)
- lucide-react untuk semua icon
- recharts untuk chart (dipakai di modul Dashboard)
- react-router-dom v6 untuk routing
- zustand untuk shared state (data pipeline, user/role aktif)

## Design system (ikuti konsisten di seluruh aplikasi)
- Background utama: abu-abu sangat terang (misal #F3F4F6)
- Sidebar: putih, dengan menu berupa icon + label. Item aktif teks tebal & gelap, item lain
  abu-abu medium.
- Card & komponen: rounded-2xl, shadow lembut (shadow-sm/shadow-md), padding nyaman.
- KPI card style: badge icon bulat berwarna di pojok kiri atas, judul kecil, angka besar bold,
  dan (kalau relevan) indikator trend naik/turun dengan panah + warna hijau/merah.
  Variasikan background KPI card: gelap/hitam, mint pastel, pink pastel, dan putih — supaya
  ada kontras visual antar card dalam satu baris.
- Topbar: search bar rounded dengan icon search, icon notifikasi dengan badge angka, avatar
  user bulat dengan indikator status.
- Palet aksen untuk chart & elemen interaktif: ungu/indigo, teal/mint, pink.
- Tipografi: sans-serif modern (pakai font Inter dari Google Fonts).
- Filter/dropdown tanggal atau tahun: bentuk pill rounded-full dengan chevron icon.

## Logo
Gunakan logo dari URL ini di halaman login dan di header sidebar:
https://jakartaventura.com/assets/img/logo/jakvent-logo.svg

## Halaman Login (route "/login")
- Card terpusat di tengah layar dengan background sesuai design system.
- Logo Jakvent di atas form.
- Field: Username/Email (text), Password (password, ada toggle show/hide), dan Role
  (dropdown/select) — KARENA BELUM ADA BACKEND, field Role ini WAJIB dan menentukan
  dashboard/menu apa yang akan tampil setelah login. Opsi Role: Admin, Appraisal, Investasi,
  Legal, Relationship Manager (RM).
- Tombol "Login": karena belum ada backend, cukup validasi field terisi lalu simpan role
  yang dipilih ke zustand store (currentUser: { role }) dan redirect ke "/dashboard".
- Sediakan cara logout (dari sidebar) yang mengembalikan ke "/login" dan clear state role.

## Layout shell (dipakai semua halaman setelah login)
- Sidebar kiri (fixed width, putih) + Main content area (kanan, background abu-abu terang).
- Isi menu sidebar BERBEDA tergantung role yang login:
  - admin: Dashboard, Pipeline, Realisasi
  - appraisal: Dashboard, Review
  - investasi: Dashboard, Review
  - legal: Dashboard, Review
  - rm (Relationship Manager): Dashboard, Review
- Tiap menu item = icon (lucide-react) + label, item yang sedang aktif (sesuai route)
  ditandai dengan style berbeda (background lembut / teks bold).
- Logo & nama "Jakvent" di bagian atas sidebar.
- Tombol Logout di bagian bawah sidebar.
- Topbar di main content: search bar dekoratif (belum perlu fungsi cari sungguhan), icon
  notifikasi dengan badge, avatar + nama role yang sedang login.

## Routing
- "/login" → halaman login
- "/dashboard" → placeholder kosong dulu (halaman "Dashboard - Coming Soon"), akan diisi di
  modul berikutnya
- "/pipeline" → placeholder (khusus role admin)
- "/review" → placeholder (khusus role appraisal/investasi/legal/rm)
- "/realisasi" → placeholder (khusus role admin)
- Route guard: kalau role yang login tidak punya akses ke suatu route (misal role "rm" coba
  akses "/pipeline"), redirect otomatis ke "/dashboard".
- Kalau belum login (currentUser kosong), semua route selain "/login" redirect ke "/login".

Fokuskan dulu ke setup, design system, login, dan layout shell ini. Halaman-halaman placeholder
akan diisi detailnya di file modul berikutnya (02-modul-pipeline.md).
