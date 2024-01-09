const Jwt = require('jsonwebtoken')

async function jwtAuthenticate(req, res, next) {
    const token = req.headers && req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
    if (!token) {
        return res.status(400).json({ message: 'Unauthorize User', error: true, data: null });
    }
    const decodeData = await Jwt.verify(token, 'ANY')
    req.user = { userId: decodeData.userId };
    next();
}
module.exports = {
    jwtAuthenticate: jwtAuthenticate
}