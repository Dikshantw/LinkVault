import { NextFunction, Request, Response } from "express";

interface AuthRequest extends Request {
    userId?: string;
    userRole?: string;
}
const roleMiddleware = (role: string) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        try{
            const userRole = req.userRole;
            if(userRole !== role){
                res.status(403).json({message: 'Forbidden'});
                return;
            }
            next();
        }catch (error:any){
            res.status(403).json({message: "Authorization Error", error: error.message })
        }
    }
}

export default roleMiddleware;