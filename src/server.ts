import app from "./app"
import { AppDataSource } from "./data-source"

const port: number = parseInt(process.env.PORT || '4000')
const host: string = process.env.HOST || 'localhost'

AppDataSource.initialize().then(async () => {
    app.listen(port, () => {
        console.log(`Server is running at http://${host}:${port}`)
    })
    
}).catch(error => console.log(error))  