import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import routes from "./routes";
import errorHandler from "./middleware/errorHandler";

const corsOption = {
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true
};
dotenv.config(); //load .env variables

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(helmet());
app.use(cors(corsOption));
app.use(cookieParser() as unknown as express.RequestHandler);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ name: "my-service", status: "ok" });
});

// Mount all routes at root so endpoints like /roles/listRoles work
app.use("/", routes);

// centralized error handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
