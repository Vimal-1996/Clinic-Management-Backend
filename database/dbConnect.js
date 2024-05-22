const mongoose = require('mongoose')


const connectDBPromise = new Promise((resolve, reject) => {
    mongoose.connect(`mongodb+srv://vimaljmathew:Vimal%401996@cmc-cluster.xsg8e7c.mongodb.net/?retryWrites=true&w=majority&appName=cmc-cluster`, {
        useNewUrlParser: true,
    })
    .then(()=>{
        resolve(`Mongodb database connected to mongodb cloud database `)
    })
    .catch((err)=>{
        reject("Failed to connect Monodb database")
    })
})

module.exports = connectDBPromise