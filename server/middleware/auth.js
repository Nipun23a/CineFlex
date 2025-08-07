import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ;

export const auth = (req,res,next) => {
    const token  = req.headers.authorization?.split('')[1];
    if (!token) return res.status(401).json({message: 'Access Denied'});

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    }catch (error){
        res.status(401).json({message:"Invalid token"});
    }
}