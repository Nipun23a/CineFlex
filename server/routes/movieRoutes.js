import express from "express";
import {auth} from "../middleware/auth.js";
import {isAdmin} from "../middleware/isAdmin.js";
import {createMovie, deleteMovie, getAllMovies, getMovieById, updateMovie} from "../controllers/movieController.js";

const router = express.Router();

router.post('/',auth,isAdmin,createMovie);
router.get('/',getAllMovies);
router.get('/:id',getMovieById);
router.put('/:id',auth,isAdmin,updateMovie);
router.delete('/:id',auth,isAdmin,deleteMovie);

export default router;