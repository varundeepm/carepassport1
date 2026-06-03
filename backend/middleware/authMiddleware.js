const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ success: false, message: 'Authorization header missing' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Token missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'carepassport_secret_key_2024');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Authentication failed', error: error.message });
    }
};
