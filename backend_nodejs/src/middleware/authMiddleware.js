const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: 'Acceso denegado' });
    }

    const tokenParts = authHeader.split(' ');

    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Token no válido' });
    }

    const token = tokenParts[1];

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token no válido' });
    }
};

module.exports = authMiddleware;