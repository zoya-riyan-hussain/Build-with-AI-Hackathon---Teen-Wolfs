import { Router } from "express";
import { store } from "../store";

const router = Router();

router.get("/performance", async (req, res): Promise<void> => {
  req.log.info({ count: store.performanceRecords.length }, "Returning performance records");
  res.json(store.performanceRecords);
});

export default router;
