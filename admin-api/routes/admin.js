const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'rahasia_super_aman';

// Middleware pakai session
function isLoggedIn(req, res, next) {
  const token = req.session.token;
  if (!token) return res.status(401).render('error', { message: 'Token tidak ditemukan (login dulu)' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).render('error', { message: 'Token tidak sah' });
  }
}

function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).render('error', { message: 'Akses ditolak: hanya admin' });
  }
  next();
}

// ✅ Tampilkan semua pembelian ke halaman EJS
router.get('/pembelian', isLoggedIn, isAdmin, (req, res) => {
  const sql = `
    SELECT 
      p.id, 
      u.username, 
      pr.nama AS produk, 
      p.jumlah, 
      p.total, 
      p.status, 
      p.tanggal
    FROM Pembelian p
    JOIN Users u ON p.user_id = u.id
    JOIN Produk pr ON p.produk_id = pr.id
    ORDER BY p.tanggal DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).render('error', { message: err.message });
    res.render('admin/pembelian', { pembelian: results, user: req.user });
  });
});

// ✅ Batalkan pembelian (POST)
router.post('/pembelian/:id/cancel', isLoggedIn, isAdmin, (req, res) => {
  const id = req.params.id;

  db.query('SELECT * FROM Pembelian WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).render('error', { message: err.message });
    if (results.length === 0) return res.status(404).render('error', { message: 'Pembelian tidak ditemukan' });

    const pembelian = results[0];
    if (pembelian.status === 'dibatalkan') {
      return res.redirect('/admin/pembelian');
    }

    db.query('UPDATE Pembelian SET status = "dibatalkan" WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).render('error', { message: err.message });

      db.query(
        'UPDATE Stok SET jumlah = jumlah + ? WHERE produk_id = ?',
        [pembelian.jumlah, pembelian.produk_id],
        (err) => {
          if (err) return res.status(500).render('error', { message: err.message });
          res.redirect('/admin/pembelian');
        }
      );
    });
  });
});

module.exports = router;
