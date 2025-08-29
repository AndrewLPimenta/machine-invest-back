import express from 'express';
import { financeController } from '../controllers/finance.controller';
import { authenticate } from '../middlewares/authenticate';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Gastos
router.post('/gastos', financeController.createExpense);
router.get('/gastos', financeController.getExpenses);
router.put('/gastos/:id', financeController.updateExpense);
router.delete('/gastos/:id', financeController.deleteExpense);

// Categorias
router.post('/categorias', financeController.createCategory);
router.get('/categorias', financeController.getCategories);

// Tipos de Investimento
router.post('/tipos-investimento', financeController.createInvestmentType);
router.get('/tipos-investimento', financeController.getInvestmentTypes);

// Investimentos
router.post('/investimentos', financeController.createInvestment);
router.get('/investimentos', financeController.getInvestments);

// Resumo
router.get('/resumo', financeController.getFinancialSummary);

export default router;