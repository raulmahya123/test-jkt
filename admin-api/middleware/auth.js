const jwt = require('jsonwebtoken');
const JWT_SECRET = 'rahasia_super_aman';

function isLoggedIn(req, res, next) {
  const token = req.session.token; // 🔁 dari session, bukan header

  if (!token) {
    return res.redirect('/auth/login'); // Lebih baik redirect daripada JSON error di UI
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    req.session.user = decoded; // simpan juga untuk akses user info
    next();
  } catch (err) {
    return res.redirect('/auth/login');
  }
}

function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).send('Akses ditolak: hanya admin');
  }
  next();
}

function isUser(req, res, next) {
  if (!req.user || req.user.role !== 'user') {
    return res.status(403).send('Akses ditolak: hanya user');
  }
  next();
}

module.exports = { isLoggedIn, isAdmin, isUser };
