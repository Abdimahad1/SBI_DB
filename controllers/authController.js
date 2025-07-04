// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user (public signup)
exports.signup = async (req, res) => {
  const { name, phone, email, password, role } = req.body;

  if (role === "Admin") {
    return res.status(403).json({
      message: "Cannot register Admin role through public signup"
    });
  }

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
      role,
      status: "active"
    });

    res.status(201).json({ message: "User registered successfully", newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ allow admin to create another admin
exports.createAdmin = async (req, res) => {
  try {
    // check if current user is admin
    if (req.userRole !== "Admin") {
      return res.status(403).json({ message: "Only admins can create another admin." });
    }

    const { name, email, phone, password } = req.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "Admin",
      status: "active"
    });

    res.status(201).json({
      message: "Admin created successfully",
      user: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        phone: newAdmin.phone,
        role: newAdmin.role
      }
    });
  } catch (err) {
    console.error("Error creating admin", err);
    res.status(500).json({ message: "Failed to create admin." });
  }
};

// Login for Investor/BusinessOwner
exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== role) {
      return res.status(403).json({
        message: `Role mismatch! Please select the correct role to log in.`
      });
    }

    if (user.status === "blocked") {
      return res.status(403).json({ message: "Your account has been blocked." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        status: user.status
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get current authenticated user's info
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

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
        role: req.body.role,
        status: req.body.status
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

// Admin-specific login
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "Admin") {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    if (user.status === "blocked") {
      return res.status(403).json({ message: "Your account has been blocked." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users (for admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user count
exports.getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Block a user
exports.blockUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { status: "blocked" },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User blocked successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Unblock a user
exports.unblockUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { status: "active" },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User unblocked successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get recent user registrations
exports.getRecentRegistrations = async (req, res) => {
  try {
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email avatar role createdAt');

    res.json(recentUsers);
  } catch (err) {
    console.error("Error fetching recent registrations:", err);
    res.status(500).json({ message: "Failed to fetch recent registrations." });
  }
};

// GET user growth grouped by month
exports.getUserGrowth = async (req, res) => {
  try {
    // group users created in each month
    const growth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // transform to simpler frontend shape
    const formatted = growth.map(item => ({
      year: item._id.year,
      month: item._id.month,
      count: item.count
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Failed to get user growth:", err.message);
    res.status(500).json({ message: "Failed to get user growth", error: err.message });
  }
};
