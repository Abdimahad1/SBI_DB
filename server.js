const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const businessProfileRoutes = require('./routes/businessProfileRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const productRoutes = require('./routes/productRoutes'); 
const goalRoutes = require('./routes/goalRoutes');
const investmentRoutes = require('./routes/investmentRoutes');
const sellBusinessRoutes = require('./routes/sellBusinessRoutes');
const customerViewRoutes = require('./routes/customerViewRoutes');
const overviewRoutes = require('./routes/overviewRoutes'); 






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
app.use('/api/profile', businessProfileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/products', productRoutes); 
app.use('/api/goals', goalRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/sell-business', sellBusinessRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/customer-view', customerViewRoutes);
app.use('/api/overview', overviewRoutes);


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
