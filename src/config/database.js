const mongoose = require('mongoose');


const connectToDb = async() => {
    await mongoose.connect("mongodb+srv://srinivasbharadwaj8:Hullur1234@cluster0.phr3z.mongodb.net/devTinder")
}

module.exports = connectToDb