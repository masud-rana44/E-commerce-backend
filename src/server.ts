import "dotenv/config";
import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

async function bootstrap() {
  await connectDB();
  app.listen(parseInt(env.PORT, 10), () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  });
}

bootstrap();
