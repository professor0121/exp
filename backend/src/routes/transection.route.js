import { Router } from "express";
import { createTransaction } from "../controllers/transaction.conroller.js";

const router = Router();

router.post("/create", createTransaction);


export default router;
