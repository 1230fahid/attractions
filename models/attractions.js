const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const ImageSchema = new Schema({
    url: String,
    filename: String
});

const opts = { toJSON: {virtuals: true}};

ImageSchema.virtual('thumbnail').get(function () { //setting up virtual property. Our database has the actual URL, but when using this function, it will apply to our URL
    return this.url.replace('/upload', '/upload/w_200');
});


const AttractionSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    geometry: { //adding geometry in. not required in JOI.
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
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
    /*image: {
        type: String,
        required: true
    },*/ //for single image
    /*images: [
        {
            url: String,
            filename: String
        }
    ],*/ // for multiple images
    images: [
        ImageSchema, //using defined image schema, so we can add virtual function        
    ],
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
}, opts)

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

AttractionSchema.virtual('properties.popUpMarkup').get(function () { //creating simple virtual for pop up markers on map
    //return this.name;
    return `<a href="/attractions/${this._id}">${this.name}</a>`
})

module.exports = mongoose.model('Attraction', AttractionSchema);