import Joi from "joi"

export const searchPaginationSchema = Joi.object({
    all: Joi.string().insensitive().valid('all').default(''),
    search: Joi.string().pattern(/^[a-zA-Z]+$/).min(3).default('')
    .messages({
        'string.pattern.base': 'Search must contain only alphabetic characters'
    }),
    page_number: Joi.number().integer().default(1),
    page_size: Joi.number().integer().default(10),
})

export const authorCreateSchema = Joi.object({
    name: Joi.string().required().error(new Error("Author name is required")),
    country: Joi.string().default(null),
})

export const authorSchema = Joi.object().keys({
    id: Joi.number().integer().positive(),
    name: Joi.string(),
    country: Joi.string(),
}).or('id', 'name')

export const bookCreateSchema = Joi.object({
    title: Joi.string().required().error(new Error("Title is required")),
    published_year: Joi.number().integer().positive(),
    author: authorSchema.required().error(new Error("Either author name or id is required")),
})

export const userCreateSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
})

export const idSchema = Joi.object({
    id: Joi.number().integer().positive().required()
})