import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (req,res) => {
    try{
        const {name,email,password} = req.body;
        const userExists = await User.findOne({email});
        if (userExists) return res.status(400).json({message: 'User Already exists'});

        const hashed = await bcrypt.hash(password,10);
        const user = await User.create({name,email,password:hashed});
        res.status(201).json({message:'Register Successfully'});
    }catch (error){
        res.status(500).json({message:'Registration Failed',error:error.message});
    }
};

export const login = async (req,res) =>{
    try{
        const {email,password} = req.body;
        const user = await user.findOne({email});

        if (!user) return res.status(400).json({message:'Invalid email or password'});
        const isMatch = await bcrypt.compare(password,user.password);

        const token = jwt.sign({id:user._id,role:user.role},JWT_SECRET,{expiresIn: '1d'});
        res.json({token,user:{id:user._id,name:user.name,role:user.role}});
    }catch (error){
        res.status(500).json({message:"Login failed",error:error.message});
    }
}



export const updatePassword = async (req,res) => {
    try {
        const {userId, oldPassword,newPassword,} = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(400).json({message:'User not found'});

        const isMatch = await bcrypt.compare(oldPassword,newPassword);
        if (!isMatch) return res.status(400).json({message:'Old password is incorrect'});

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.status(200).json({message:"Password updated successfully"});
    }catch (error){
        res.status(500).json({message:'Failed to update password',error:error.message})
    }
}