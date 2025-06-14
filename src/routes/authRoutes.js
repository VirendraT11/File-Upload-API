const express = require('express');
const router = express.Router();
const { login } = require('../middleware/auth');
const database = require('../config/database');

router.post('/login', login);

router.post('/register', async (req, res) => {
    try{
        const { email, password, role = 'user' } = req.body;

        if( !email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const existingUser = database.getUserByEmail(email);
        if(existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const newsUer = database.addUser({ email, password, role });

        if (!newsUer) {
            return res.status(500).json({ error: 'Error creating user' });
        }

        res.json({
            message: 'User created successfully',
            user: {
                id: newsUer.id,
                email: newsUer.email,
                role: newsUer.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/profile', require('../middleware/auth').authenticateToken, (req, res) => {
    const user = database.getUserById(req.user.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json({
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        }
    });
});

module.exports = router;