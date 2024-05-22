const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const connectDBPromise = require('./database/dbConnect')
const registerApi = require('../Backend/Login_Func/login')
const passportConfig = require('../Backend/authentication/googleOauth');
const passport = require('passport')
const session  =require('express-session')
require('dotenv').config();
const PORT = process.env.PORT;
const app = express()
app.use(cors())
app.use(express.json())

connectDBPromise.then((success_message)=>{
    console.log(success_message)
}).catch((error_message)=>{
    console.log(error_message)
})

app.use('/',registerApi);

const server = app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)   
})

