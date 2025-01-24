import express, { Express } from "express"
import cors from "cors";
import { AppDataSource } from "./data-source"
import authorRoutes from "./routes/authorRoutes"
import bookRoutes from "./routes/bookRoutes"

const app: Express = express()
const port: number = 5432
app.use(cors())

app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

app.use('/authors', authorRoutes)
app.use('/books', bookRoutes)

AppDataSource.initialize().then(async () => {
    app.listen(port, () => {
        console.log(`Server is running at http://dpg-cu964d56l47c73d6g32g-a:${port}`);
    })
    
}).catch(error => console.log(error))