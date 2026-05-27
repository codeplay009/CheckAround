import express from "express";
import cors from "cors";
import { env } from "./config/env";
import cron from "node-cron";
import { deleteExpiredEvents } from "./jobs/deleteExpiredEvents";

import eventRoutes from "./routes/event.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/events", eventRoutes);

// runs every day at 1 AM
cron.schedule("0 1 * * *", async () => {
  console.log("Running expired events cleanup...");
  await deleteExpiredEvents();
});

app.listen(env.PORT, () => {
  console.log("Server running");
});
