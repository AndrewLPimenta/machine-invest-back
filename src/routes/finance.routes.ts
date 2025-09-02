
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

// Categorias de Gasto
router.post('/categorias', financeController.createCategory);
router.get('/categorias', financeController.getCategories);
router.put('/categorias/:id', financeController.updateCategory);
router.delete('/categorias/:id', financeController.deleteCategory);

// Tipos de Investimento
router.post('/tipos-investimento', financeController.createInvestmentType);
router.get('/tipos-investimento', financeController.getInvestmentTypes);
router.put('/tipos-investimento/:id', financeController.updateInvestmentType);
router.delete('/tipos-investimento/:id', financeController.deleteInvestmentType);

// Investimentos
router.post('/investimentos', financeController.createInvestment);
router.get('/investimentos', financeController.getInvestments);
router.put('/investimentos/:id', financeController.updateInvestment);
router.delete('/investimentos/:id', financeController.deleteInvestment);

// Resumo Financeiro
router.get('/resumo', financeController.getFinancialSummary);

export default router;
