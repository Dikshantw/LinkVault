import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
    userId?: string;
    userRole?: string;
}

const authMiddleware = (req: AuthRequest, res:Response, next: NextFunction): void => {
    try {
        
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            res.status(401).json({message: 'Unauthorized'});
            return;
        }
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : authHeader;
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {id: string,role: string}
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    }catch (error){
        res.status(401).json({message: "Invalid token"})
    }
};

export default authMiddleware;