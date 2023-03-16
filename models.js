const mongoose = require('mongoose');

/**
 * 
 */
const placeModel = mongoose.Schema({
    type: {
        type: String,
        required: '{PATH} is required!'
    },
}, {
    timestamps: true
});

/**
 * 
 */
const personModel = mongoose.Schema({
    name: {
        type: String,
        required: '{PATH} is required!'
    },
    place: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place'
    }
}, {
    timestamps: true
});

/**
 * 
 */
const userSchema = new mongoose.Schema({
    first_name: { type: String, default: null },
    last_name: { type: String, default: null },
    email: { type: String, unique: true },
    password: { type: String },
    token: { type: String },
});

module.exports = {
    Person: mongoose.model('Person', personModel),
    Place: mongoose.model('Place', placeModel),
    User: mongoose.model("User", userSchema)
};