import express from "express";
import cors from "cors";
import { env } from "./config/env";
import routes from "./routes/index";

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

app.use("/api", routes);

export default app;
