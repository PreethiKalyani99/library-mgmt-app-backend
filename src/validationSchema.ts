import Joi from "joi"

export const schema = Joi.object({
    search: Joi.string().regex(/^[a-zA-Z]+$/).min(3)
    .messages({
        'string.pattern.base': 'Search must contain only alphabetic characters'
    }),
    page_number: Joi.string().regex( /^[0-9]+$/).default(1),
    page_size: Joi.string().regex( /^[0-9]+$/).default(10)
})