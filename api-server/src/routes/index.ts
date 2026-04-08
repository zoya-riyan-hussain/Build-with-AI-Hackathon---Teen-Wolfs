import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profileRouter from "./profile";
import careersRouter from "./careers";
import simulationRouter from "./simulation";
import performanceRouter from "./performance";
import feedbackRouter from "./feedback";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profileRouter);
router.use(careersRouter);
router.use(simulationRouter);
router.use(performanceRouter);
router.use(feedbackRouter);
router.use(dashboardRouter);

export default router;
