/**
 * HealthCenter.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
	connection: 'mongo',
    attributes: {
        name: {
            type: 'string',
            required: true,
            maxLength: 1000
        }
        ,geometry: {
            required: true,
        }
        , place: {
            required: true,
        }

        , "num_total_comments": {
            required: true,
        }
    }
};

