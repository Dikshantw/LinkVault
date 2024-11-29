import express, { Request, Response } from "express"
import { signinSchema, signupSchema } from "../validation/userValidation";
import User from "../models/User";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import authMiddleware from "../middleware/authMiddleware";
import roleMiddleware from "../middleware/roleMiddleware";

const router = express.Router();

interface AuthRequest extends Request {
    userId?: string;
    userRole?: string;
}

router.post('/signup', async (req: Request, res: Response): Promise<any> => {
    try {
        const parsedData = signupSchema.parse(req.body);
        const existingUser = await User.findOne({email: parsedData.email});
        if(existingUser){
            return res.status(400).json({message: 'Email already in use'})
        }

        const hashedPassword = await bcrypt.hash(parsedData.password, 10);

        const newUser = new User({
            email: parsedData.email,
            password: hashedPassword,
            role: parsedData.role
        });
        await newUser.save();

        res.status(201).json({message: 'User registered successfully'})
    } catch (error: any) {
        if (error.name === "ZodError"){
            return res.status(400).json({errors: error.errors});
        }
        res.status(500).json({message: 'server error', error: error.message});
    }
});

router.post('/signin', async(req: Request, res:Response): Promise<any> => {
    try {
        const parsedData = signinSchema.parse(req.body)
        
        const user = await User.findOne({email: parsedData.email});
        if(!user){
            return res.status(401).json({message: 'Invalid email or password'});
        }

        const isPasswordValid = await bcrypt.compare(parsedData.password, user.password);
        if(!isPasswordValid){
            return res.status(401).json({message: 'Invalid email or Password'});
        }

        const token = jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET as string, {
            expiresIn: '1h'
        });

        res.status(200).json({message: "SignIn Successfull", token});
    } catch (error: any){
        if(error.name === 'zodError') {
            return res.status(400).json({errors: error.errors});
        }
        res.status(500).json({message: 'Server error', error: error.message});
    }
});

router.get('/profile', authMiddleware, (req: AuthRequest, res: Response) => {
    res.status(200).json({message: 'Access granted', userId: (req as any).userId})
})

router.get('/admin', authMiddleware, roleMiddleware('admin'), (req: AuthRequest, res:Response) => {
    res.status(200).json({message: "Welcome Admin"})
})
export default router;