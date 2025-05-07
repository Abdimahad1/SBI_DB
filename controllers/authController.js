const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
exports.signup = async (req, res) => {
  const { name, phone, email, password, role } = req.body;

  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone number already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      phone,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({ message: "User registered successfully", newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login an existing user
exports.login = async (req, res) => {
  const { email, password, role } = req.body; // ✅ frontend must send role

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Ensure role matches
    if (user.role !== role) {
      return res.status(403).json({
        message: `Role mismatch! Please select the correct role to log in.`
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get current authenticated user's info
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT: Fully update user
exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        name: req.body.name,
        phone: req.body.phone,
        role: req.body.role
      },
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH: Partially update user with secure password change
exports.partialUpdateUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, currentPassword, password, confirmPassword } = req.body;

    if (name) user.name = name;

    if (password || confirmPassword || currentPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      if (!password || !confirmPassword) {
        return res.status(400).json({ message: "New and confirm password are required" });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ message: "New passwords do not match" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();
    res.json({ message: "User updated successfully", name: user.name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
