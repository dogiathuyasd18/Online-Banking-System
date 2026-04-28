import { Router } from 'express'
import * as authController from '../controllers/authController'
import * as accountController from '../controllers/accountController'
import * as transactionController from '../controllers/transactionController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()

// Public routes
router.post('/users/register', authController.register)
router.post('/users/login', authController.login)

// Protected routes
router.get('/profile', authMiddleware, accountController.getProfile)
router.put('/profile', authMiddleware, accountController.updateProfile)
router.post('/accounts', authMiddleware, accountController.createAccount)
router.get('/accounts/:accountId/balance', authMiddleware, accountController.getBalance)
router.post('/cards', authMiddleware, accountController.createCard)
router.delete('/cards/:cardId', authMiddleware, accountController.deleteCard)

router.post('/accounts/deposit', authMiddleware, transactionController.deposit)
router.post('/accounts/withdrawal', authMiddleware, transactionController.withdraw)
router.post('/accounts/transfer', authMiddleware, transactionController.transfer)
router.get('/accounts/:accountId/history', authMiddleware, transactionController.getHistory)

export default router
