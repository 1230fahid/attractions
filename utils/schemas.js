//create Joi object to require and validate properties
const Joi = require('joi');

module.exports.attractionSchema = Joi.object({
    attraction: Joi.object({
        name: Joi.string().required(),
        region: Joi.string().required(),
        country: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.string().required()
    }).required()
});