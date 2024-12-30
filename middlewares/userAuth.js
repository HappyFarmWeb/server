const jwt = require('jsonwebtoken');

const userAuth = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).send({ error: 'Access denied. No Authorization header provided.' });
    }

    const token = authHeader.replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, process.env.JSON_WEB_TOKEN_SECRET_KEY);
        req.user = decoded;
        next(); 
    } catch (err) {
        res.status(400).send({ error: 'Invalid token.' });
    }
};

module.exports = userAuth;