const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const campsite = require('./campsite');
const user = require('./user')

const favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: [campsite]
    },
    campsites: {
        type: mongoose.Schema.Types.ObjectId,
        ref: [user]
    }
})

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;