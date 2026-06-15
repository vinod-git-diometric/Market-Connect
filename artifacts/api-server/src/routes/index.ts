import { Router, type IRouter } from "express";
import healthRouter from "./health";
import marketRouter from "./market";
import vendorsRouter from "./vendors";
import reservationsRouter from "./reservations";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(marketRouter);
router.use(vendorsRouter);
router.use(reservationsRouter);
router.use(adminRouter);

export default router;
