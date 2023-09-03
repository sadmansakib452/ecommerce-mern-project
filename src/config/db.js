const mongoose = require('mongoose')
const { mongodbURL } = require('../secret')
const logger = require('../controllers/loggerController')

const connectDatabase = async(options={})=>{
    try{
        await mongoose.connect(mongodbURL, options)
        logger.log('info','Connection to DB is successfully established')

        mongoose.connection.on('error', (error)=>{
            logger.log('error','DB connection error: ',error)
        })

    }catch(error){
        logger.log('log',"Could not connect to DB: ", error.toString());
    }
}

module.exports = connectDatabase