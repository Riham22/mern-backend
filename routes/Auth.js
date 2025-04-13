import express  from 'express';
import { forgotPassword, logIn, logout, resetPassword, signUp } from '../controllers/AuthControllers.js';
import { userVerification } from '../middlewares/AuthMiddlewares.js';
import { addTask, deleteTask, getTasks, updateTask } from './../controllers/TaskController.js';
const router = express.Router();
router.post('/register',signUp );
router.post('/login',logIn);
router.get('/home',userVerification );
router.post('/logout',logout);
router.post('/forgot',forgotPassword);
router.post('/reset/:token', resetPassword);
router.get('/tasks', userVerification,getTasks);          
router.post('/add',userVerification, addTask);         
router.put('/edit/:id',userVerification, updateTask);    
router.delete('/delete/:id', userVerification, deleteTask); 

export default router;