import { Router } from "express"
import { verifyToken } from "../middleware/verifyToken"
import authorRoutes from '../routes/authorRoutes'
import bookRoutes from "../routes/bookRoutes"
import userRoutes from "../routes/userRoutes"
import "../strategies/local-strategies"

const router = Router()

router.use('/authors', verifyToken, authorRoutes)
router.use('/books', verifyToken,  bookRoutes)
router.use('/users', userRoutes)

export default router