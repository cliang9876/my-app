import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import errorHandler from "./middleware/errorHandler";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Mount all routes at root so endpoints like /roles/listRoles work
app.use("/", routes);

// centralized error handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
