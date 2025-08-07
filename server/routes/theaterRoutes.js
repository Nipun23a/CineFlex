import express from "express";
import {
    createTheater,
    deleteTheater,
    getAllTheaters,
    getTheaterById,
    updateTheater
} from "../controllers/theaterController.js";
import {auth} from "../middleware/auth.js";
import {isAdmin} from "../middleware/isAdmin.js";

const router = express.Router();

router.post('/',auth,isAdmin,createTheater);
router.get('/',getAllTheaters);
router.get('/:id',getTheaterById);
router.put('/:id',auth,isAdmin,updateTheater);
router.delete('/:id',auth,isAdmin,deleteTheater);

export default router;