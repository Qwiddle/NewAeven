import express from "express";
import { AuthManager } from '../authManager.js';

export class Router {
	constructor() {
		this.router = express.Router();

		this.router.post("/register", AuthManager.register);
		this.router.post("/login", AuthManager.login);
		this.router.post("/player", AuthManager.player);
	}
}