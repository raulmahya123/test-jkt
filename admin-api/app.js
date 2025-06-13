const express = require('express');
const path = require('path');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');

const app = express();

// Setup view engine
app.set('view engine', 'ejs');
app.set('views', [
    path.join(__dirname, 'views'),             // untuk user
    path.join(__dirname, 'admin-api', 'views') // untuk admin
  ]);
  
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // jika kamu punya CSS/JS client

// Session setup
app.use(session({
  secret: 'secret123', // GANTI di production
  resave: false,
  saveUninitialized: true
}));

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

// Home atau fallback
app.get('/', (req, res) => {
  res.send('Selamat datang di Sistem Admin Pembelian');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
