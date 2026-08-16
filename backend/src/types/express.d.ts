// Module augmentation: attach JWT payload ke Express Request (req.user).
// TODO: ganti `any` dengan tipe JwtPayload yang proper.
import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export {};