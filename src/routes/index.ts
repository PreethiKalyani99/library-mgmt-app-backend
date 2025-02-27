import { Router } from "express"
import { verifyToken } from "../middleware/verifyToken"
import authorRoutes from '../routes/authorRoutes'
import bookRoutes from "../routes/bookRoutes"
import userRoutes from "../routes/userRoutes"
import borrowedBooksRoutes from "../routes/borrowedBookRoutes"
import mapRoutes from "../routes/mapRoutes"
import roleRoutes from "../routes/roleRoute"
import scrapeRoute from "../routes/scrapeRoute"
import { authorizeRole } from "../middleware/authorization"
import "../strategy/localStrategy"

const router = Router()

router.use('/authors', verifyToken, authorRoutes)
router.use('/books', verifyToken,  bookRoutes)
router.use('/users', userRoutes)
router.use('/borrow', verifyToken, borrowedBooksRoutes)
router.use('/roles', verifyToken, authorizeRole([]), roleRoutes)
router.use('/map', mapRoutes)
router.use('/news', scrapeRoute)

export default router