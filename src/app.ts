import express from "express";
import "dotenv/config";
import UserRouter from "./routes/UserRouter.js";
import ProductRouter from "./routes/ProductRouter.js";
import SupplierRouter from "./routes/SupplierRouter.js";
import CategoryRouter from "./routes/CategoryRouter.js";
import DiscountRouter from "./routes/DiscountRouter.js";
import ReceiptRouter from "./routes/ReceiptRouter.js";
import bodyParser from "body-parser";
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use("/api/v1", ProductRouter);
app.use("/api/v1", UserRouter);
app.use("/api/v1", SupplierRouter);
app.use("/api/v1", CategoryRouter);
app.use("/api/v1", DiscountRouter);
app.use("/api/v1", ReceiptRouter);

const port = parseInt(process.env.PORT) || 8000;
const host = process.env.HOST || "localhost";

app.listen(port, host, () => {
  console.log("Listening on port ", host + ":", port);
});
