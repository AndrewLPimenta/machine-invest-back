// controllers/finance.controller.ts
import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface AuthRequest extends Request {
  userId?: number
}

export const financeController = {
  // ======================
  // GASTOS
  // ======================

  async createExpense(req: AuthRequest, res: Response) {
    try {
      const { valor, descricao, idCategoria, tipoPeriodo, dataGasto } = req.body
      const userId = req.userId

      if (!userId)
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' })

      const gasto = await prisma.gasto.create({
        data: {
          idUsuario: userId,
          valor: parseFloat(valor),
          descricao,
          idCategoria: idCategoria ? Number(idCategoria) : null,
          tipoPeriodo,
          dataGasto: dataGasto ? new Date(dataGasto) : new Date(),
        },
        include: { categoria: true },
      })

      res.status(201).json({ success: true, data: gasto, message: 'Gasto criado com sucesso' })
    } catch (error: any) {
      console.error('Erro ao criar gasto:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async getExpenses(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId
      if (!userId)
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' })

      const { page = 1, limit = 10, startDate, endDate, categoria } = req.query
      const skip = (Number(page) - 1) * Number(limit)

      const where: any = { idUsuario: userId }
      if (startDate || endDate) {
        where.dataGasto = {}
        if (startDate) where.dataGasto.gte = new Date(startDate as string)
        if (endDate) where.dataGasto.lte = new Date(endDate as string)
      }
      if (categoria) where.idCategoria = Number(categoria)

      const [gastos, total] = await Promise.all([
        prisma.gasto.findMany({
          where,
          include: { categoria: true },
          orderBy: { dataGasto: 'desc' },
          skip,
          take: Number(limit),
        }),
        prisma.gasto.count({ where }),
      ])

      res.json({
        success: true,
        data: gastos,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      })
    } catch (error: any) {
      console.error('Erro ao buscar gastos:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async updateExpense(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const { valor, descricao, idCategoria, tipoPeriodo, dataGasto } = req.body
      const userId = req.userId
      if (!userId)
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' })

      const existingGasto = await prisma.gasto.findFirst({ where: { id: Number(id), idUsuario: userId } })
      if (!existingGasto)
        return res.status(404).json({ success: false, message: 'Gasto não encontrado' })

      const gasto = await prisma.gasto.update({
        where: { id: Number(id) },
        data: {
          valor: valor ? parseFloat(valor) : undefined,
          descricao,
          idCategoria: idCategoria ? Number(idCategoria) : null,
          tipoPeriodo,
          dataGasto: dataGasto ? new Date(dataGasto) : undefined,
          dataAtualizacao: new Date(),
        },
        include: { categoria: true },
      })

      res.json({ success: true, data: gasto, message: 'Gasto atualizado com sucesso' })
    } catch (error: any) {
      console.error('Erro ao atualizar gasto:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async deleteExpense(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const userId = req.userId
      if (!userId)
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' })

      const existingGasto = await prisma.gasto.findFirst({ where: { id: Number(id), idUsuario: userId } })
      if (!existingGasto)
        return res.status(404).json({ success: false, message: 'Gasto não encontrado' })

      await prisma.gasto.delete({ where: { id: Number(id) } })
      res.json({ success: true, message: 'Gasto deletado com sucesso' })
    } catch (error: any) {
      console.error('Erro ao deletar gasto:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async createCategory(req: AuthRequest, res: Response) {
    try {
      const { nome, descricao } = req.body
      const userId = req.userId
      if (!userId)
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' })

      const categoria = await prisma.categoriaGasto.create({
        data: { idUsuario: userId, nome, descricao },
      })

      res.status(201).json({ success: true, data: categoria, message: 'Categoria criada com sucesso' })
    } catch (error: any) {
      console.error('Erro ao criar categoria:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async getCategories(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId
      if (!userId)
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' })

      const categorias = await prisma.categoriaGasto.findMany({ where: { idUsuario: userId }, orderBy: { nome: 'asc' } })
      res.json({ success: true, data: categorias })
    } catch (error: any) {
      console.error('Erro ao buscar categorias:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // ======================
  // INVESTIMENTOS
  // ======================

  async createInvestmentType(req: AuthRequest, res: Response) {
    try {
      const { nome, descricao } = req.body
      const userId = req.userId
      if (!userId)
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' })

      const tipoInvestimento = await prisma.tipoInvestimento.create({
        data: { idUsuario: userId, nome, descricao },
      })

      res.status(201).json({ success: true, data: tipoInvestimento, message: 'Tipo de investimento criado com sucesso' })
    } catch (error: any) {
      console.error('Erro ao criar tipo de investimento:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async getInvestmentTypes(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId
      if (!userId)
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' })

      const tiposInvestimento = await prisma.tipoInvestimento.findMany({
        where: { idUsuario: userId },
        orderBy: { nome: 'asc' },
      })

      res.json({ success: true, data: tiposInvestimento })
    } catch (error: any) {
      console.error('Erro ao buscar tipos de investimento:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async createInvestment(req: AuthRequest, res: Response) {
    try {
      const { valor, descricao, idTipoInvestimento, dataInvestimento } = req.body
      const userId = req.userId
      if (!userId)
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' })

      const investimento = await prisma.investimento.create({
        data: {
          idUsuario: userId,
          valor: parseFloat(valor),
          descricao,
          idTipoInvestimento: idTipoInvestimento ? Number(idTipoInvestimento) : null,
          dataInvestimento: dataInvestimento ? new Date(dataInvestimento) : new Date(),
        },
        include: { tipoInvestimento: true },
      })

      res.status(201).json({ success: true, data: investimento, message: 'Investimento criado com sucesso' })
    } catch (error: any) {
      console.error('Erro ao criar investimento:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async getInvestments(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId
      if (!userId)
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' })

      const { page = 1, limit = 10, startDate, endDate, tipo } = req.query
      const skip = (Number(page) - 1) * Number(limit)

      const where: any = { idUsuario: userId }
      if (startDate || endDate) {
        where.dataInvestimento = {}
        if (startDate) where.dataInvestimento.gte = new Date(startDate as string)
        if (endDate) where.dataInvestimento.lte = new Date(endDate as string)
      }
      if (tipo) where.idTipoInvestimento = Number(tipo)

      const [investimentos, total] = await Promise.all([
        prisma.investimento.findMany({
          where,
          include: { tipoInvestimento: true },
          orderBy: { dataInvestimento: 'desc' },
          skip,
          take: Number(limit),
        }),
        prisma.investimento.count({ where }),
      ])

      res.json({
        success: true,
        data: investimentos,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      })
    } catch (error: any) {
      console.error('Erro ao buscar investimentos:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async getFinancialSummary(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId
      if (!userId)
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' })

      const { startDate, endDate } = req.query

      const whereGasto: any = { idUsuario: userId }
      const whereInvestimento: any = { idUsuario: userId }

      if (startDate || endDate) {
        whereGasto.dataGasto = {}
        whereInvestimento.dataInvestimento = {}
        if (startDate) {
          whereGasto.dataGasto.gte = new Date(startDate as string)
          whereInvestimento.dataInvestimento.gte = new Date(startDate as string)
        }
        if (endDate) {
          whereGasto.dataGasto.lte = new Date(endDate as string)
          whereInvestimento.dataInvestimento.lte = new Date(endDate as string)
        }
      }

      const [totalGastos, totalInvestimentos, gastosPorCategoria, investimentosPorTipo] = await Promise.all([
        prisma.gasto.aggregate({ where: whereGasto, _sum: { valor: true } }),
        prisma.investimento.aggregate({ where: whereInvestimento, _sum: { valor: true } }),
        prisma.gasto.groupBy({ by: ['idCategoria'], where: whereGasto, _sum: { valor: true } }),
        prisma.investimento.groupBy({ by: ['idTipoInvestimento'], where: whereInvestimento, _sum: { valor: true } }),
      ])

      res.json({
        success: true,
        data: {
          totalGastos: totalGastos._sum.valor || 0,
          totalInvestimentos: totalInvestimentos._sum.valor || 0,
          saldo: (totalInvestimentos._sum.valor || 0) - (totalGastos._sum.valor || 0),
          gastosPorCategoria,
          investimentosPorTipo,
        },
      })
    } catch (error: any) {
      console.error('Erro ao buscar resumo financeiro:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },
}

