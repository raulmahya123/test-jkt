# 🛒 Sistem Admin Pembelian

Aplikasi web sederhana untuk:

- Melihat daftar produk
- Melakukan pembelian
- Melihat riwayat pembelian
- Login/logout pengguna (admin & user)

---

## 🔧 Cara Menjalankan

### 1. Clone dan Install
```bash
git clone https://github.com/namauser/nama-repo.git
cd nama-repo
npm install
```

CREATE DATABASE pembelian;
USE pembelian;

- Buat tabel Produk, Stok, Pembelian, Users
- Contoh struktur:
- Produk(id, nama, harga)
- Stok(produk_id, jumlah)
- Pembelian(id, user_id, produk_id, jumlah, total, status, tanggal)
- Users(id, username, password, role)

---

3. Atur Konfigurasi Database di db.js
```const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'passwordmu',
  database: 'pembelian'
});
```
4. Jalankan Aplikasi
node index.js

6. Akses di Browser
http://localhost:3000
🔐 Login

Buat akun secara manual di tabel Users.

Role user: bisa beli dan lihat riwayat
Role admin: akses admin panel (jika ada)
📁 Struktur Folder

``` /routes
  auth.js
  user.js
  admin.js
/views
  login.ejs
  produk.ejs
  riwayat.ejs
/index.js
/db.js
```
