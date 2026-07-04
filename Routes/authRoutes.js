const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = authMiddleware.authorize;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-env';

// Local fallback users for development when DB is unavailable
const _fallbackPlain = [
    { username: 'cashier', password: '123456', email: 'cashier@crownstores.com', name: 'John Cashier', role: 'agent' },
    { username: 'manager', password: '123456', email: 'manager@crownstores.com', name: 'Sarah Manager', role: 'manager' },
    { username: 'director', password: '123456', email: 'director@crownstores.com', name: 'Ahmed Director', role: 'director' }
];
const fallbackUsers = _fallbackPlain.map(u => ({
    username: u.username.toLowerCase(),
    passwordHash: bcrypt.hashSync(u.password, 10),
    email: u.email,
    name: u.name,
    role: u.role
}));

// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { username, password, email, name } = req.body;

        // Validate input (role is NOT provided by user; it will be assigned by admin)
        if (!username || !password || !email || !name) {
            return res.status(400).json({ message: 'Username, password, email and name are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        // Create new user as pending (requires admin approval to assign role)
        const user = new User({
            username,
            password,
            email,
            name,
            role: 'pending',
            isActive: false
        });

        await user.save();

        res.status(201).json({
            message: 'Registration successful. Awaiting admin approval.'
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Registration failed', error: err.message });
    }
});

// Admin endpoint: approve user and assign role (director only)
router.post('/approve/:id', authMiddleware, authorize('director'), async (req, res) => {
    try {
        const { role } = req.body;
        if (!['agent', 'manager', 'director'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.role = role;
        user.isActive = true;
        await user.save();

        res.json({ message: 'User approved and role assigned', user: user.toJSON() });
    } catch (err) {
        console.error('Approve error:', err);
        res.status(500).json({ message: 'Failed to approve user', error: err.message });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // If MongoDB is connected, use real DB
        if (mongoose.connection && mongoose.connection.readyState === 1) {
            const user = await User.findOne({ username });
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            if (!user.isActive) {
                return res.status(401).json({ message: 'User account is inactive' });
            }

            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user._id, username: user.username, role: user.role },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    role: user.role,
                    email: user.email
                }
            });
        }

        // Fallback when DB is unavailable (development only)
        const uname = username.toLowerCase();
        const fbUser = fallbackUsers.find(u => u.username === uname);
        if (!fbUser) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const ok = await bcrypt.compare(password, fbUser.passwordHash);
        if (!ok) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: 'fallback-' + fbUser.username, username: fbUser.username, role: fbUser.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.json({
            message: 'Login successful (dev fallback)',
            token,
            user: {
                id: 'fallback-' + fbUser.username,
                name: fbUser.name,
                username: fbUser.username,
                role: fbUser.role,
                email: fbUser.email
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Login failed', error: err.message });
    }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ user: user.toJSON() });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch user', error: err.message });
    }
});

// Logout endpoint (client-side just removes token)
router.post('/logout', authMiddleware, (req, res) => {
    res.json({ message: 'Logout successful' });
});

module.exports = router;
