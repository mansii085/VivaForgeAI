import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: errorMessages,
        });
      } else {
        next(error);
      }
    }
  };
};
