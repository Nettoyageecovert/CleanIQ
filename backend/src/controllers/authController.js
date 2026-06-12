const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Temporary in-memory storage (will be replaced with Supabase later)
const users = [];

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
    // Check if email already exists
    const existingUser = users.find(u => u.email === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: `user_${Date.now()}`,
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'employee',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

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
    const user = users.find(u => u.email === email.toLowerCase());
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

module.exports = { register, login };