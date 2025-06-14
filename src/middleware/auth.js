const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if(err) {
            return res.status(403).json({ error: 'Invalid or expired token'});
        }
        req.user = user;
        next();
    });
};

const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if(!err) {
                req.user = user;
            }
            next();
        });
    }
    next();
};

const authorize = (roles = []) => {
    return (req, res, next) => {
        if(!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if(roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role || 'user'
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION_TIME || '1d' }
    );
};

const login = async (req, res) => {
    const { email, password } = req.body;

    const users = [
        { id: 1, email: 'admin@example.com', password: 'admin', role: 'admin' },
        { id: 2, email: 'user@example.com', password: 'user', role: 'user' }
    ];

    const user = users.find(u => u.email === email && u.password === password);

    if(!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
        message: 'Login successful',
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role
        }
    });
};

module.exports = {
    authenticateToken,
    optionalAuth,
    authorize,
    generateToken,
    login
};