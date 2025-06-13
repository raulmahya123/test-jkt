const express = require('express');
const router = express.Router();
const db = require('../db');
const { isLoggedIn, isUser } = require('../middleware/auth');

// =======================
// ✅ JSON API Bagian
// =======================

// Ambil semua produk
router.get('/produk', isLoggedIn, isUser, (req, res) => {
  db.query('SELECT * FROM Produk', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Buat pembelian
router.post('/pembelian', isLoggedIn, isUser, (req, res) => {
    const { produk_id, jumlah } = req.body;
    const user_id = req.session.user.id;
  
    db.query('SELECT harga FROM Produk WHERE id = ?', [produk_id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Terjadi kesalahan server');
      }
      if (result.length === 0) return res.status(404).send('Produk tidak ditemukan');
  
      const harga = result[0].harga;
      const total = harga * jumlah;
  
      db.query('SELECT jumlah FROM Stok WHERE produk_id = ?', [produk_id], (err, stokResult) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Terjadi kesalahan server');
        }
  
        const stok = stokResult[0]?.jumlah || 0;
        if (stok < jumlah) {
          return res.status(400).send('Stok tidak cukup');
        }
  
        db.query(
          'INSERT INTO Pembelian (user_id, produk_id, jumlah, total) VALUES (?, ?, ?, ?)',
          [user_id, produk_id, jumlah, total],
          (err, result) => {
            if (err) {
              console.error(err);
              return res.status(500).send('Gagal melakukan pembelian');
            }
  
            db.query(
              'UPDATE Stok SET jumlah = jumlah - ? WHERE produk_id = ?',
              [jumlah, produk_id],
              (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).send('Gagal mengupdate stok');
                }
                // Redirect ke halaman produk setelah berhasil beli
                res.redirect('/user/view/produk');
              }
            );
          }
        );
      });
    });
  });
  

// Lihat riwayat pembelian user
router.get('/pembelian', isLoggedIn, isUser, (req, res) => {
  const user_id = req.session.user.id;

  db.query(
    `SELECT p.id, pr.nama, p.jumlah, p.total, p.status, p.tanggal
     FROM Pembelian p
     JOIN Produk pr ON p.produk_id = pr.id
     WHERE p.user_id = ?
     ORDER BY p.tanggal DESC`,
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// =======================
// ✅ EJS UI Bagian
// =======================

// Tampilkan semua produk dan form pembelian
router.get('/view/produk', isLoggedIn, isUser, (req, res) => {
  db.query('SELECT * FROM Produk', (err, results) => {
    if (err) return res.status(500).send('Gagal ambil produk');
    res.render('produk', { produk: results });
  });
});

// Tampilkan riwayat pembelian user
router.get('/view/pembelian', isLoggedIn, isUser, (req, res) => {
  const user_id = req.session.user.id;

  db.query(
    `SELECT p.id, pr.nama, p.jumlah, p.total, p.status, p.tanggal
     FROM Pembelian p
     JOIN Produk pr ON p.produk_id = pr.id
     WHERE p.user_id = ?
     ORDER BY p.tanggal DESC`,
    [user_id],
    (err, results) => {
      if (err) return res.status(500).send('Gagal ambil riwayat');
      res.render('riwayat', { pembelian: results });
    }
  );
});

module.exports = router;
