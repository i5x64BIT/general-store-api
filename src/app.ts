import express from "express";
import "dotenv/config";
import UserRouter from "./routes/UserRouter.js";
import ProductRouter from "./routes/ProductRouter.js";
import SupplierRouter from "./routes/SupplierRouter.js";
import CategoryRouter from "./routes/CategoryRouter.js";
import DiscountRouter from "./routes/DiscountRouter.js";
import ReceiptRouter from "./routes/ReceiptRouter.js";
import AuthRouter from "./routes/AuthRouter.js";
import bodyParser from "body-parser";
import cors from "cors";
import dbConnection from "./services/db/dbConnection.js";
import AuthanticateError from "./routes/Errors/AuthanticateError.js";
import AuthoriseError from "./routes/Errors/AuthoriseError.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// parse application/json
app.use(bodyParser.json());

//CORS
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173", "http://localhost:3030"],
  })
);
const dbPromise = dbConnection.connect();

app.use("/api/v1", ProductRouter);
app.use("/api/v1", UserRouter);
app.use("/api/v1", SupplierRouter);
app.use("/api/v1", CategoryRouter);
app.use("/api/v1", DiscountRouter);
app.use("/api/v1", ReceiptRouter);
app.use("/api/v1/auth", AuthRouter);

app.use((e, req, res, next) => {
  console.log(e);
  if (e.code === 11000) {
    res.status(400).json({
      messege: "This email address is already occupied.",
    });
    return;
  }
  if (e instanceof AuthanticateError) {
    res.status(400).json({
      messege: "Incorrect email or password",
    });
    return;
  }
  if (e instanceof AuthoriseError) {
    res.status(403).json({
      messege: "Forbidden",
    });
    return;
  }
  if (e instanceof jwt.TokenExpiredError) {
    res.status(401).json({
      messege: "Token Expired",
    });
    return;
  }
  if (e.name === "ValidationError") {
    res.status(400).json({
      messege: "Bad product parameters, please check your inputs and try again",
    });
    return;
  }
  if (e.code === 11000) {
    res.status(400).json({
      messege: "An item matching those fields already exists.",
    });
    return;
  }
  if (e) {
    res.status(500).json({
      messege: "Something went wrong, try again later.",
    });
    return;
  }
});
const port = parseInt(process.env.PORT) || 8000;
const host = process.env.HOST || "localhost";

dbPromise.then((res) => {
  // Listen after a connection to the database was established
  res.ok
    ? app.listen(port, host, () => {
        console.log("Listening on port ", host + ":", port);
      })
    : console.log(res.error);
});

process.on("SIGINT", async () => {
  await dbConnection.disconnect();
  process.exit();
});
