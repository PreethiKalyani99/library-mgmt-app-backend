import app from "./app"
import { AppDataSource } from "./data-source"

const port: number = 5432

AppDataSource.initialize().then(async () => {
    app.listen(port, () => {
        console.log(`Server is running at http://dpg-cv4n94gfnakc73bqc5lg-a:${port}`)
    })
    
}).catch(error => console.log(error))  