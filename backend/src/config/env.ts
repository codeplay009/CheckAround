import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || "5000",

  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "",

  DATABASE_URL: process.env.DATABASE_URL || "",
  
};
