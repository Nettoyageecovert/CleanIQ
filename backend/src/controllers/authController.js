const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { getUserStore } = require('../storage');

// Helper: Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// REGISTER - POST /api/auth/register
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, email, password } = req.body;

  try {
    const userStore = getUserStore();
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existingUser = await userStore.findByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await userStore.createEmployee({
      fullName: fullName.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// LOGIN - POST /api/auth/login
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const userStore = getUserStore();
    const user = await userStore.findByEmail(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

const toPublicUser = (user) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
});

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const userStore = getUserStore();
    const user = await userStore.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.status(200).json({ user: toPublicUser(user) });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// PATCH /api/auth/profile
const updateProfile = async (req, res) => {
  const { fullName } = req.body;
  if (!fullName?.trim() || fullName.trim().length < 2) {
    return res.status(400).json({ message: 'Name must be at least 2 characters.' });
  }

  try {
    const userStore = getUserStore();
    const updatedUser = await userStore.updateProfile(req.user.id, { fullName: fullName.trim() });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({
      message: 'Profile updated successfully.',
      user: toPublicUser(updatedUser),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// PATCH /api/auth/password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required.' });
  }

  if (newPassword.length < 8 || !/(?=.*[a-zA-Z])(?=.*[0-9])/.test(newPassword)) {
    return res.status(400).json({
      message: 'New password must be at least 8 characters with letters and numbers.',
    });
  }

  try {
    const userStore = getUserStore();
    const user = await userStore.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await userStore.updatePassword(user.id, passwordHash);

    return res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

module.exports = { register, login, updateProfile, changePassword, getMe };