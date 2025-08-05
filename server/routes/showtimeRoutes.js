import express from "express";
import {auth} from "../middleware/auth.js";
import {isAdmin} from "../middleware/isAdmin.js";
import {
    createShowtime,
    deleteShowtime,
    getAllShowtimes,
    getShowtimeById,
    updateShowtime
} from "../controllers/showtimeController.js";

const router = express.Router();

router.post('/',auth,isAdmin,createShowtime);
router.get('/',getAllShowtimes);
router.get('/:id',getShowtimeById);
router.put('/:id',auth,isAdmin,updateShowtime);
router.delete('/:id',auth,isAdmin,deleteShowtime);

export default router;
