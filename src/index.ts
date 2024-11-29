import express  from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/health',(req,res)=>{
    res.send({status: 'OK'})
});

app.use('/api/auth', authRoutes )

const startServer = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('Connected to MongoDB');

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error)
    }
};

startServer();