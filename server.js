const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const businessProfileRoutes = require('./routes/businessProfileRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const productRoutes = require('./routes/productRoutes'); 
const businessOverviewRoutes = require('./routes/businessOverviewRoutes');
const businessGrowthRoutes = require('./routes/businessGrowthRoutes');
const goalRoutes = require('./routes/goalRoutes');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route Definitions
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/profile', businessProfileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/products', productRoutes); 
app.use('/api/overview', businessOverviewRoutes);
app.use('/api/growth', businessGrowthRoutes);
app.use('/api/goals', goalRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
