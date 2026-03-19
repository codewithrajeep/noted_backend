import express from "express";
import cors from "cors";
import { env } from "./config/env";
import routes from "./routes/index";
import { errorHandler } from "./middlewares/errorHandler";
import { requestLogger } from "./middlewares/requestLogger";
import helmet from "helmet";
import { generalLimiter } from "./middlewares/rateLimiter";

const app = express();

app.use(helmet())
app.use(express.json());
app.use(
  cors({
    origin: env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(requestLogger);
app.use(generalLimiter);
app.get("/", (req, res) => {
  res.send("Server is up and running");
});

app.use("/api", routes);

app.use(errorHandler);

export default app;
