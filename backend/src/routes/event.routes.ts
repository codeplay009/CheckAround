import express from "express";

import {
  announceCommunityEvent,
  getCommunityEvents,
  getEventFeed,
  getPendingCommunityEvents,
  getSupplementaryEvents,
  updateCommunityEventReviewStatus,
} from "../controllers/event.controller";

const router = express.Router();

router.get("/", getCommunityEvents);
router.post("/", announceCommunityEvent);
router.get("/feed", getEventFeed);
router.get("/supplementary", getSupplementaryEvents);
router.get("/admin/pending", getPendingCommunityEvents);
router.patch("/admin/:id/status", updateCommunityEventReviewStatus);

export default router;
