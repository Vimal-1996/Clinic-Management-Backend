const jwt = require('jsonwebtoken')

const generateWebToken = (payload) => {
    const { userId, email,role } = payload
    return new Promise(async (resolve, reject) => {
        jwt.sign({ 'userId': userId, 'email': email, role:role },"mysecret" ,{ expiresIn: '1h' }, (err, token) => {
            if (token) {
                resolve({token:token, email:email})
            } else if (err) {
                reject(err)
            }
        })
    })
}

const verifyWebToken = (payload)=>{
    return new Promise(async(resolve,reject)=>{
        const {token,id,role} = payload
        try{
            await jwt.verify(token,"mysecret")
        }catch(err){
            return null
        }
    })
}



module.exports = { generateWebToken,verifyWebToken }