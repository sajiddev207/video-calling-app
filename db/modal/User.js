const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt')

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    userPass: {
        type: String,
        required: true
    },
    deviceId: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Number,
        default: () => Date.now()
    }
})

UserSchema.pre('save', async function (next) {
    if (!this.isModified('userPass')) {
        return next();
    }
    try {
        this.userPass = await bcrypt.hash(this.userPass, 10)
        next();
    } catch (error) {
        console.log('error_', error);
        return next(error);
    }

})

UserSchema.options.toJson = {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.userPass;
        delete ret.__v;
        return ret;
    }
}

module.exports = mongoose.model('User', UserSchema, 'User')