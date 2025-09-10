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
      if (!userId) return res.status(401).json({ success: false, message: 'Usuário não autenticado' })

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
      console.error(error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async getExpenses(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId
      if (!userId) return res.status(401).json({ success: false, message: 'Usuário não autenticado' })

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
      console.error(error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async updateExpense(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const { valor, descricao, idCategoria, tipoPeriodo, dataGasto } = req.body
      const userId = req.userId
      if (!userId) return res.status(401).json({ success: false, message: 'Usuário não autenticado' })

      const existing = await prisma.gasto.findFirst({ where: { id: Number(id), idUsuario: userId } })
      if (!existing) return res.status(404).json({ success: false, message: 'Gasto não encontrado' })

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
      console.error(error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async deleteExpense(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const userId = req.userId
      if (!userId) return res.status(401).json({ success: false, message: 'Usuário não autenticado' })

      const existing = await prisma.gasto.findFirst({ where: { id: Number(id), idUsuario: userId } })
      if (!existing) return res.status(404).json({ success: false, message: 'Gasto não encontrado' })

      await prisma.gasto.delete({ where: { id: Number(id) } })
      res.json({ success: true, message: 'Gasto deletado com sucesso' })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // ======================
  // CATEGORIAS DE GASTOS
  // ======================
  async createCategory(req: AuthRequest, res: Response) {
    try {
      const { nome, descricao } = req.body
      const userId = req.userId
      if (!userId) return res.status(401).json({ success: false, message: 'Usuário não autenticado' })

      const categoria = await prisma.categoriaGasto.create({
        data: { nome, descricao, idUsuario: userId },
      })

      res.status(201).json({ success: true, data: categoria, message: 'Categoria criada com sucesso' })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async getCategories(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId
      if (!userId) return res.status(401).json({ success: false, message: 'Usuário não autenticado' })

      const categorias = await prisma.categoriaGasto.findMany({ where: { idUsuario: userId }, orderBy: { nome: 'asc' } })
      res.json({ success: true, data: categorias })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async updateCategory(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const { nome, descricao } = req.body
      const userId = req.userId
      if (!userId) return res.status(401).json({ success: false, message: 'Usuário não autenticado' })

      const existing = await prisma.categoriaGasto.findFirst({ where: { id: Number(id), idUsuario: userId } })
      if (!existing) return res.status(404).json({ success: false, message: 'Categoria não encontrada' })

      const categoria = await prisma.categoriaGasto.update({
        where: { id: Number(id) },
        data: { nome, descricao },
      })

      res.json({ success: true, data: categoria, message: 'Categoria atualizada com sucesso' })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async deleteCategory(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const userId = req.userId
      if (!userId) return res.status(401).json({ success: false, message: 'Usuário não autenticado' })

      const existing = await prisma.categoriaGasto.findFirst({ where: { id: Number(id), idUsuario: userId } })
      if (!existing) return res.status(404).json({ success: false, message: 'Categoria não encontrada' })

      await prisma.categoriaGasto.delete({ where: { id: Number(id) } })
      res.json({ success: true, message: 'Categoria deletada com sucesso' })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // ======================
  // TIPOS DE INVESTIMENTO
  // ======================
  async createInvestmentType(req: AuthRequest, res: Response) {
    try {
      const { nome, descricao } = req.body
      const userId = req.userId
      if (!userId) return res.status(401).json({ success: false, message: 'Usuário não autenticado' })

      const tipo = await prisma.tipoInvestimento.create({
        data: { nome, descricao, idUsuario: userId },
      })

      res.status(201).json({ success: true, data: tipo, message: 'Tipo de investimento criado com sucesso' })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async getInvestmentTypes(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId
      if (!userId) return res.status(401).json({ success: false, message: 'Usuário não autenticado' })

      const tipos = await prisma.tipoInvestimento.findMany({
        where: { idUsuario: userId },
        orderBy: { nome: 'asc' },
      })

      res.json({ success: true, data: tipos })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async updateInvestmentType(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const { nome, descricao } = req.body
      const userId = req.userId
      if (!userId) return res.status(401).json({ success: false, message: 'Usuário não autenticado' })

      const existing = await prisma.tipoInvestimento.findFirst({ where: { id: Number(id), idUsuario: userId } })
      if (!existing) return res.status(404).json({ success: false, message: 'Tipo de investimento não encontrado' })

      const tipo = await prisma.tipoInvestimento.update({
        where: { id: Number(id) },
        data: { nome, descricao },
      })

      res.json({ success: true, data: tipo, message: 'Tipo de investimento atualizado com sucesso' })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async deleteInvestmentType(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const userId = req.userId
      if (!userId) return res.status(401).json({ success: false, message: 'Usuário não autenticado' })

      const existing = await prisma.tipoInvestimento.findFirst({ where: { id: Number(id), idUsuario: userId } })
      if (!existing) return res.status(404).json({ success: false, message: 'Tipo de investimento não encontrado' })

      await prisma.tipoInvestimento.delete({ where: { id: Number(id) } })
      res.json({ success: true, message: 'Tipo de investimento deletado com sucesso' })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // ======================
  // INVESTIMENTOS
  // ======================
  async createInvestment(req: AuthRequest, res: Response) {
    try {
      const { valor, descricao, idTipoInvestimento, dataInvestimento } = req.body
      const userId = req.userId
      if (!userId) return res.status(401).json({ success: false, message: 'Usuário não autenticado' })

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
      console.error(error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async getInvestments(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId
      if (!userId) return res.status(401).json({ success: false, message: 'Usuário não autenticado' })

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
      console.error(error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async updateInvestment(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const { valor, descricao, idTipoInvestimento, dataInvestimento } = req.body
      const userId = req.userId
      if (!userId) return res.status(401).json({ success: false, message: 'Usuário não autenticado' })
  
      const existing = await prisma.investimento.findFirst({ where: { id: Number(id), idUsuario: userId } })
      if (!existing) return res.status(404).json({ success: false, message: 'Investimento não encontrado' })
  
      const investimento = await prisma.investimento.update({
        where: { id: Number(id) },
        data: {
          descricao: descricao ?? existing.descricao,
          valor: valor !== undefined ? parseFloat(valor) : existing.valor,
          idTipoInvestimento: idTipoInvestimento ? Number(idTipoInvestimento) : existing.idTipoInvestimento,
          dataInvestimento: dataInvestimento ? new Date(dataInvestimento) : existing.dataInvestimento,
          dataAtualizacao: new Date(),
        },
        include: { tipoInvestimento: true },
      })
  
      res.json({ success: true, data: investimento, message: 'Investimento atualizado com sucesso' })
    } catch (error: any) {
      console.error("Erro ao atualizar investimento:", error)
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  async deleteInvestment(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const userId = req.userId
      if (!userId) return res.status(401).json({ success: false, message: 'Usuário não autenticado' })

      const existing = await prisma.investimento.findFirst({ where: { id: Number(id), idUsuario: userId } })
      if (!existing) return res.status(404).json({ success: false, message: 'Investimento não encontrado' })

      await prisma.investimento.delete({ where: { id: Number(id) } })
      res.json({ success: true, message: 'Investimento deletado com sucesso' })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  
async getFinancialSummary(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }

    const { startDate, endDate } = req.query;

    // Construir filtros de data
    const gastoDateFilter: any = {};
    const investimentoDateFilter: any = {};

    if (startDate) {
      gastoDateFilter.gte = new Date(startDate as string);
      investimentoDateFilter.gte = new Date(startDate as string);
    }
    if (endDate) {
      gastoDateFilter.lte = new Date(endDate as string);
      investimentoDateFilter.lte = new Date(endDate as string);
    }

    const whereGasto: any = { idUsuario: userId };
    if (startDate || endDate) whereGasto.dataGasto = gastoDateFilter;

    const whereInvestimento: any = { idUsuario: userId };
    if (startDate || endDate) whereInvestimento.dataInvestimento = investimentoDateFilter;

    // Agregações
    const [totalGastos, totalInvestimentos, gastosPorCategoria, investimentosPorTipo] =
      await Promise.all([
        prisma.gasto.aggregate({
          where: whereGasto,
          _sum: { valor: true },
        }),
        prisma.investimento.aggregate({
          where: whereInvestimento,
          _sum: { valor: true },
        }),
        prisma.gasto.groupBy({
          by: ['idCategoria'],
          where: whereGasto,
          _sum: { valor: true },
        }),
        prisma.investimento.groupBy({
          by: ['idTipoInvestimento'],
          where: whereInvestimento,
          _sum: { valor: true },
        }),
      ]);

    // Enriquecer com nomes
    const categorias = await prisma.categoriaGasto.findMany({ where: { idUsuario: userId } });
    const tiposInvestimento = await prisma.tipoInvestimento.findMany({ where: { idUsuario: userId } });

    const gastosDetalhados = gastosPorCategoria.map(g => ({
      idCategoria: g.idCategoria,
      nome: categorias.find(c => c.id === g.idCategoria)?.nome || 'Sem categoria',
      total: g._sum.valor ?? 0,
    }));

    const investimentosDetalhados = investimentosPorTipo.map(i => ({
      idTipoInvestimento: i.idTipoInvestimento,
      nome: tiposInvestimento.find(t => t.id === i.idTipoInvestimento)?.nome || 'Sem tipo',
      total: i._sum.valor ?? 0,
    }));

    res.json({
      success: true,
      data: {
        totalGastos: totalGastos._sum.valor ?? 0,
        totalInvestimentos: totalInvestimentos._sum.valor ?? 0,
        saldo: (totalInvestimentos._sum.valor ?? 0) - (totalGastos._sum.valor ?? 0),
        gastosPorCategoria: gastosDetalhados,
        investimentosPorTipo: investimentosDetalhados,
      },
    });
  } catch (error: any) {
    console.error('Erro ao gerar resumo financeiro:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

}
