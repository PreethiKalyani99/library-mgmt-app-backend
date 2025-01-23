import express, { Express } from "express"
import { AppDataSource } from "./data-source"
import authorRoutes from "./routes/authorRoutes"
import bookRoutes from "./routes/bookRoutes"

const app: Express = express()
const port: number = 4000

app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

app.use('/authors', authorRoutes)
app.use('/books', bookRoutes)

AppDataSource.initialize().then(async () => {
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    })
    
}).catch(error => console.log(error))
