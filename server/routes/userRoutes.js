import express from "express";
import {auth} from "../middleware/auth.js";
import {isAdmin} from "../middleware/isAdmin.js";
import {createAdmin, getAllUsers, getUserById, updateUserInfo} from "../controllers/userController.js";

const router = express.Router();

router.post('/create-admin',auth,isAdmin,createAdmin);
router.get('/',auth,isAdmin,getAllUsers);
router.put('/update',auth,updateUserInfo);
router.get('/:id',auth,getUserById);

export default router;