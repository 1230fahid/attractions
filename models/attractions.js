const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const AttractionSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    region: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

AttractionSchema.post('findOneAndDelete', async function (doc) { //runs after Attraction model deletes an attraction
    console.log("DELETED!!!");
    if (doc) {
        await Review.deleteMany({ //delete all reviews where their ID field is in our document that was just deleted in it reviews array.
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Attraction', AttractionSchema);