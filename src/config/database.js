const mongoose = require('mongoose');

const connectToDb = async() => {
    await mongoose.connect(process.env.MONGO_DB_CONNECTION_STRING)
}

module.exports = connectToDb