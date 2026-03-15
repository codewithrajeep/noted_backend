import app from "./app";
import logger from "./lib/logger";
import { env } from "./config/env";

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server is running on port: http://localhost:${PORT}`);
});
