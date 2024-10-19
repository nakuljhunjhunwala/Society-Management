// src/middleware/validate.ts
import { handleError } from '@utils/response.util.js';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Request, Response, NextFunction } from 'express';

export function validateRequest<T>(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dtoObj = plainToInstance(dtoClass, req.body);
    const errors: ValidationError[] = await validate(dtoObj, {
      whitelist: true
    });

    if (errors.length > 0) {
      const extractErrors = (errors: ValidationError[]): string[] => {
        return errors.flatMap((error) => {
          if (error.children && error.children.length > 0) {
            return extractErrors(error.children);
          }
          return Object.values(error.constraints || {});
        });
      };

      const messages = extractErrors(errors);

      return handleError(res, messages);
    } else {
      req.body = dtoObj; // if validation passes, replace body with the validated object
      next();
    }
  };
}
