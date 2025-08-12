import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const createAdmin = async (req,res) => {
    try {
        const {name,email,password} = req.body;

        const existingUser = await User.findOne({email});
        if (existingUser) return res.status(400).json({message:'Email already in use'});

        const hashedPassword = await bcrypt.hash(password,10);
        const admin = new User({
            name,email,password:hashedPassword,role:'admin'
        });
        await admin.save();
        res.status(201).json({message:'Admin created successfully',admin});
    }catch (error){
        res.status(500).json({message:'Failed create admin role',error:error.message});
    }
}

export const getAllUsers = async (req,res) => {
    try {
        const users = await User.find().select('-password');
        res.status(201).json(users);
    }catch (error){
        res.status(500).json({message:'Failed to get users',error:error.message});
    }
}

export const updateUserInfo = async (req, res) => {
    try {
        // Prefer the authenticated id from auth middleware
        const userId = req.user?.id || req.body.userId;
        if (!userId) return res.status(400).json({ message: "Missing userId" });

        const { name, email } = req.body;
        const update = {};
        if (typeof name === "string") update.name = name.trim();
        if (typeof email === "string") update.email = email.trim();

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            update,
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        return res.status(200).json({ message: "User info updated", user: updatedUser });
    } catch (error) {
        console.error("updateUserInfo error:", error);
        return res.status(500).json({ message: "Failed to update user", error: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('-password');

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get user', error: err.message });
    }
};