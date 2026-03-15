import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import transactionsRouter from "./transactions.js";
import withdrawalRequestsRouter from "./withdrawal-requests.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/users/:slug/transactions", transactionsRouter);
router.use(withdrawalRequestsRouter);

export default router;
