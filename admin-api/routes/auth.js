const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'rahasia_super_aman'; // Pindahkan ke .env di production

// Halaman Login
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Proses Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM Users WHERE username = ?', [username], async (err, results) => {
    if (err) return res.render('login', { error: 'Terjadi kesalahan server' });
    if (results.length === 0) return res.render('login', { error: 'User tidak ditemukan' });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.render('login', { error: 'Password salah' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // ✅ Simpan token di session
    req.session.token = token;

    // ✅ Redirect berdasarkan role
    if (user.role === 'admin') {
      res.redirect('/admin/pembelian');
    } else if (user.role === 'user') {
      res.redirect('/user/view/produk');
    } else {
      res.redirect('/auth/login');
    }
  });
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
});

module.exports = router;
