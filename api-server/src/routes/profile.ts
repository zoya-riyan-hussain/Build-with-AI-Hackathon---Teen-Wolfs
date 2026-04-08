import { Router } from "express";
import { store } from "../store";
import {
  SaveProfileBody,
  SaveProfileResponse,
  GetProfileResponse,
} from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router = Router();

router.get("/profile", async (req, res): Promise<void> => {
  if (!store.profile) {
    res.status(404).json({ error: "No profile found" });
    return;
  }
  const parsed = GetProfileResponse.parse(store.profile);
  res.json(parsed);
});

router.post("/profile", async (req, res): Promise<void> => {
  const parsed = SaveProfileBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid profile body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const profile = {
    id: store.profile?.id ?? randomUUID(),
    ...parsed.data,
    createdAt: store.profile?.createdAt ?? new Date().toISOString(),
  };

  store.profile = profile;
  req.log.info({ id: profile.id }, "Profile saved");
  res.json(SaveProfileResponse.parse(profile));
});

export default router;
