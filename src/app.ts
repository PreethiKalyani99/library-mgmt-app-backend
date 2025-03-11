import express, { Express } from "express"
import cors from "cors";
import routes from "./routes/index"
import passport from "passport";

const app: Express = express()
app.use(cors())

app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

app.use(passport.initialize())
app.use(routes)

export default app