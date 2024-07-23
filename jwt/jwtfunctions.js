const jwt = require('jsonwebtoken')

const generateWebToken = (payload) => {
    const { userId, email, role } = payload
    return new Promise(async (resolve, reject) => {
        const refreshToken = await jwt.sign({ 'userId': userId, 'email': email, role: role }, "myrefreshsecret")
        const token = await jwt.sign({ 'userId': userId, 'email': email, role: role }, "myaccesssecret", { expiresIn: '10m' });
        if (refreshToken && token) {
            resolve({ token: token, email: email, refreshToken: refreshToken })
        } else {
            reject("Tokens not created")
        }
    })
}

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) {
        return res.sendStatus(401)
    }
    else {
        await jwt.verify(token, "myaccesssecret", (err, user) => {
            if (err) {
                console.log("failed to verify token")
                return res.sendStatus(403)
            } else {
                req.user = user;
                console.log("token successfully verified")
                next();
            }
        })
    }
}

const reCreatesAcessToken = async () => {
    const authHeader = req.headers['authorization']
    const refreshToken = authHeader && authHeader.split(' ')[1]
    if (refreshToken == null) {
        return res.sendStatus(401)
    }
    else {
        await jwt.verify(refreshToken, 'myrefreshsecret', (err, user) => {
            if (err) {
                return res.sendStatus(403)
            } else {
                const token = jwt.sign({ 'userId': user.userId, 'email': user.email, role: user.role }, "myaccesssecret", { expiresIn: '10m' });
                resolve({ token: token, email: email, refreshToken: refreshToken })
            }
        })
    }
}




module.exports = { generateWebToken, authenticateToken,reCreatesAcessToken }