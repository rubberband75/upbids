import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const user = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: false
    },
    emailVerified: {
        type: Date,
        required: false
    }
});

mongoose.models = {};

var User = mongoose.model('User', user);

export default User;