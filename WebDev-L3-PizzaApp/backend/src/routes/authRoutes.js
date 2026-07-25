const express = require('express');
const router = express.Router();
const { registerUser, verifyEmail, loginUser, loginAdmin, getProfile, updateProfile, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.get('/verify/:token', verifyEmail);
router.post('/login', loginUser);
router.post('/admin-login', loginAdmin);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

module.exports = router;
