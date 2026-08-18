import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodEffects, ZodError, ZodSchema } from 'zod';

type SchemaType = ZodSchema | AnyZodObject | ZodEffects<any>;

export interface RequestValidationSchema {
  body?: SchemaType;
  query?: SchemaType;
  params?: SchemaType;
}

/**
 * Reusable Request Validation Middleware
 * Validates request body, query parameters, and route parameters against Zod schemas.
 * Replaces unvalidated request parts with parsed and sanitized data.
 */
export function validate(schema: RequestValidationSchema | SchemaType) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if schema is a full RequestValidationSchema or a single body schema
      if ('body' in schema || 'query' in schema || 'params' in schema) {
        const validationSchema = schema as RequestValidationSchema;

        if (validationSchema.params) {
          req.params = (await validationSchema.params.parseAsync(req.params)) as any;
        }

        if (validationSchema.query) {
          req.query = (await validationSchema.query.parseAsync(req.query)) as any;
        }

        if (validationSchema.body) {
          req.body = await validationSchema.body.parseAsync(req.body);
        }
      } else {
        // Direct single body schema passed
        req.body = await (schema as SchemaType).parseAsync(req.body);
      }

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(error);
      }
      return next(error);
    }
  };
}

/**
 * Convenience helper to validate only request body
 */
export function validateBody(schema: SchemaType) {
  return validate({ body: schema });
}

/**
 * Convenience helper to validate only query parameters
 */
export function validateQuery(schema: SchemaType) {
  return validate({ query: schema });
}

/**
 * Convenience helper to validate only route parameters
 */
export function validateParams(schema: SchemaType) {
  return validate({ params: schema });
}
