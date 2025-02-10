import Joi from "joi"

export const searchPaginationSchema = Joi.object({
    all: Joi.string().insensitive().valid('all').default(''),
    search: Joi.string().regex(/^[a-zA-Z0-9@.]+$/).min(3).default('')
    .messages({
        'string.pattern.base': 'Search must contain only alphanumeric characters, @, and .'
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
    password: Joi.string().min(8).required(),
})

export const userUpdateSchema = Joi.object({
    role: Joi.string().required() 
})

export const adminUserCreateSchema = userCreateSchema.append({
    role: Joi.string().required(),
})

export const idSchema = Joi.object({
    id: Joi.number().integer().positive().required()
})

export const userSchema = Joi.object().keys({
    id: Joi.number().integer().positive(),
    email: Joi.string().email()
}).or('id', 'email')

export const bookSchema = Joi.object().keys({
    id: Joi.number().integer().positive(),
    title: Joi.string(),
}).or('id', 'title')

export const borrowedBookCreateSchema = Joi.object({
    book: bookSchema
        .required()
        .error(new Error("Either book id or title is required")),
    borrower: userSchema
        .required()
        .error(new Error("Either borrower id or email is required")),
    borrow_date: Joi.date()
        .iso()
        .required()
        .error(new Error("Borrow date must be a valid date (YYYY-MM-DD)")),
    return_date: Joi.date()
        .iso()
        .allow(null)
        .error(new Error("Return date must be a valid date (YYYY-MM-DD) and after borrow date"))
})

export const borrowedBookUpdateSchema = Joi.object({
    return_date: Joi.date()
    .iso()
    .required()
    .error(new Error("Return date must be a valid date (YYYY-MM-DD) and after borrow date"))
})

export const roleSchema = Joi.object({
    role: Joi.string().required().error(new Error("Role is required"))
})