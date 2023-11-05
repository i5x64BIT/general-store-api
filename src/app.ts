import express from "express";
import "dotenv/config";
import UserRouter from "./routes/User/UserRouter.js";
import ProductRouter from "./routes/Product/ProductRouter.js";
import SupplierRouter from "./routes/Supplier/SupplierRouter.js";
import CategoryRouter from "./routes/Category/CategoryRouter.js";
import DiscountRouter from "./routes/Discount/DiscountRouter.js";
import ReceiptRouter from "./routes/Receipt/ReceiptRouter.js";
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
