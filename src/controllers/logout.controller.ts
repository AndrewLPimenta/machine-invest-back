import { Request, Response } from "express";
import { prisma } from "../prisma/client";

export const logoutUser = async (req: Request, res: Response) => {
  res.clearCookie("token");
  return res.json({ status: "success", message: "Logout realizado com sucesso" });
};


