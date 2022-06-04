const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');
//const AppError = require('./AppError');

const extension = (joi) => ({ //create function with joi input
    type: 'string',
    base: joi.string(), // works only on string
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: { //checks to see if html in input string
            validate(value, helpers) { //use package sanitize-html to strip off html from string
                const clean = sanitizeHtml(value, {
                    allowedTags: [], //no html tags or attributes allowed, since nothing is defined inside
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value }) //if there is a difference between original string and new stripped string, that means there was HTML, so we return an error message, defined above, and an error value
                return clean;
            }
        }
    }
});


//create Joi object to require and validate properties
const Joi = BaseJoi.extend(extension); //original joi plus our new extension

module.exports.attractionSchema = Joi.object({
    attraction: Joi.object({
        name: Joi.string().required().escapeHTML(),
        region: Joi.string().required().escapeHTML(),
        country: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
        //image: Joi.string().required() //get rid of for now
    }).required(),
    deleteImages: Joi.array() //adding in for deleting selected images
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required().escapeHTML(),
        rating: Joi.number().required()
    }).required()
});