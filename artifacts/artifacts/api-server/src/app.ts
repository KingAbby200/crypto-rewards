import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import { connectMongoDB } from "./lib/mongodb.js";
import router from "./routes/index.js";

const app: Express = express();

const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors({
    credentials: true,
    origin: corsOrigin ? corsOrigin.split(",").map((o) => o.trim()) : true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "crypto-dashboard-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

connectMongoDB().catch(console.error);

app.use("/api", router);

export default app;
