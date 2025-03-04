const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const connectDBPromise = require('./database/dbConnect')
const patientLoginApi = require('./Login_Func/patientLogin')
const adminLoginApi = require('./Login_Func/adminLogin')
const doctorLoginApi = require('./Login_Func/doctorLogin')

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

app.use('/admin',adminLoginApi);
app.use('/patient',patientLoginApi);
app.use('/doctor',doctorLoginApi)

const server = app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)   
})

