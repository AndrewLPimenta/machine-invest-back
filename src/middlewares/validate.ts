import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export const validate =
    (schema: ZodObject<any>) =>
        (req: Request, res: Response, next: NextFunction): Response | void => {
            const result = schema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({
                    error: "Dados inválidos",
                    issues: result.error.issues,
                });
            }
            next();
        };