import express from "express";
import cors from "cors";
import { env } from "./config/env";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.get("/", (req, res) => {
  res.send("Server is up and running");
});

export default app;
