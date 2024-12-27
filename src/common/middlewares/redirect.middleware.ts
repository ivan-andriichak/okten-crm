import { NextFunction, Request, Response } from 'express';

export function redirectToLogin(req: Request, res: Response, next: NextFunction): void {
  if (req.originalUrl === '/') {
    return res.redirect('/login');
  }
  next();
}
