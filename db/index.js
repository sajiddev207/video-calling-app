const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Db Connect Successfully'))
    .catch((err) => console.log('Error to connect db :- ', err))

module.exports = {
    User: require('./modal/User')
}