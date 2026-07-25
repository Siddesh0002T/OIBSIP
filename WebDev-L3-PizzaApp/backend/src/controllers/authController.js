const crypto = require('crypto');
const User = require('../models/User');
const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const verificationToken = crypto.randomBytes(20).toString('hex');
  const user = await User.create({
    name,
    email,
    password,
    verificationToken
  });

  if (user) {
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    const message = `Please verify your email by clicking: \n\n ${verifyUrl}`;

    console.log(`[DEV ONLY] Verification link: ${verifyUrl}`);

    try {
      await sendEmail({
        email: user.email,
        subject: 'Email Verification - Pizza App',
        message,
      });
      res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
    } catch (error) {
      console.error(error);
      res.status(201).json({ message: 'Registration successful but email sending failed. DEV LINK: ' + verifyUrl });
    }
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify/:token
// @access  Public
const verifyEmail = async (req, res) => {
  const user = await User.findOne({ verificationToken: req.params.token });
  if (!user) {
    return res.status(400).json({ message: 'Invalid token' });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email first.' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Admin login
// @route   POST /api/auth/admin-login
// @access  Public
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });

  if (admin && (await admin.matchPassword(password))) {
    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token: generateToken(admin._id),
      role: 'admin'
    });
  } else {
    res.status(401).json({ message: 'Invalid admin credentials' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.address = req.body.address !== undefined ? req.body.address : user.address;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      address: updatedUser.address,
      phone: updatedUser.phone,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  const message = `You requested a password reset. Please click on the link below to reset your password:\n\n${resetUrl}`;
  
  console.log(`[DEV ONLY] Password reset link: ${resetUrl}`);

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      message
    });
    res.status(200).json({ message: 'Email sent' });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(500).json({ message: 'Email could not be sent. DEV LINK: ' + resetUrl });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({ message: 'Password updated successfully' });
};

module.exports = { registerUser, verifyEmail, loginUser, loginAdmin, getProfile, updateProfile, forgotPassword, resetPassword };
