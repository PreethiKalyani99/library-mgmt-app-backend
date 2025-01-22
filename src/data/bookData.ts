import { AppDataSource } from "../data-source";
import { Books } from "../entity/Books";
import { Authors } from "../entity/Authors";


interface BookProps {
    author_id?: number;
    published_year?: number; 
}

interface InsertProps extends BookProps{
    title: string
}

interface UpdateProps extends BookProps{
    book_id: number
    title?: string
}

interface ListBooksProps {
    book_id:  number | null
}

const books = AppDataSource.getRepository(Books)
const authors = AppDataSource.getRepository(Authors)

async function isAuthorAvailable(author_id: number) {
    const author = await authors.findOne({ where: { author_id } })
    if (author) {
        return author
    }
}

export async function insertBook({ title, author_id, published_year }: InsertProps) {
    const newBook = new Books()
    newBook.title = title

    if(author_id){
        const author = await isAuthorAvailable(author_id)

        if (!author) {
            throw new Error(`Author id ${author_id} not found`)
        }
        newBook.author = author
    }

    if(published_year){
        newBook.published_year = published_year
    }

    await books.save(newBook)
}   

export async function updateBook({ book_id, title, author_id, published_year }: UpdateProps){
    const bookToUpdate = await books.findOne({ where: { book_id: book_id}})

    if(!bookToUpdate){
        throw new Error(`Book with id ${book_id} not found`)
    }

    if(title){
        bookToUpdate.title = title
    }

    if(author_id){
        const author = await isAuthorAvailable(author_id)
        if (!author) {
            throw new Error(`Author id ${author_id} not found`)
        }

        bookToUpdate.author = author
    }

    if(published_year){
        bookToUpdate.published_year = published_year
    }

    books.save(bookToUpdate)
    return bookToUpdate
}

export async function deleteBook(book_id: number){
    const bookToDelete = await books.findOne({ where: { book_id }})

    if(!bookToDelete){
        throw new Error(`Book with id ${book_id} not found`)
    }
    await books.remove(bookToDelete)

    return bookToDelete
}

export async function listBooks({ book_id }: ListBooksProps){
    if(book_id){
        const book = await books.findOne({ where: { book_id }, relations: ['author']})
    
        if(book){
           return book
        }
        else{
            throw new Error(`Book with id ${book_id} not found`)
        }
    }
    else{
        const allBooks = await books.find({relations: ['author']})
        return allBooks
    }
}