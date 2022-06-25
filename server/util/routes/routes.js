import express from "express";
import { AuthManager } from '../authManager.js';


const router = express.Router();

router.post("/register", AuthManager.register);
router.post("/login", AuthManager.login);
router.post("/player", AuthManager.playerLogin);

export { router };
