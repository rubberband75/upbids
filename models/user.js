import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const user = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    emailVerified: {
        type: Boolean,
        required: true
    }
});

mongoose.models = {};

var User = mongoose.model('User', user);

export default User;