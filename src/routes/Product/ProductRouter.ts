import express from "express";
import dbConnection from "../../helpers/db/dbConnection.js";
import AuthoriseError from "../Errors/AuthoriseError.js";
import { ProductModel } from "../../models/ProductModel.js";
import { checkUserAuthorization } from "../helpers/helpers.js";

const router = express.Router();

router.post("/product", checkUserAuthorization);
router.put("/products/:productId", checkUserAuthorization);
router.delete("/products/:productId", checkUserAuthorization);
router.get("/products", (req, res, next) => {
  const offset: any = req.query.offset || 0;
  let limit: any = req.query.limit || 25;

  if (limit > 25) {
    // force a limit if above 25
    limit = 25;
  }

  (async () => {
    try {
      await dbConnection.connect();
      const porducts = await ProductModel.find({}).skip(offset).limit(limit);
      res.status(200).json(porducts);
      await dbConnection.disconnect();
    } catch (e) {
      next(e);
    }
  })();
});
router.post("/product", (req, res, next) => {
  const nProduct = new ProductModel({
    ...req.body.product
  });
  (async () => {
    try {
      await dbConnection.connect();
      const rProduct = await nProduct.save();
      await dbConnection.disconnect();
      res.status(200).json(rProduct);
    } catch (e) {
      next(e);
    }
  })();
});
router.put("/products/:productId", (req, res, next) => {
  (async () => {
    try {
      await dbConnection.connect();
      const rProduct = await ProductModel.findOneAndUpdate(
        { _id: req.params.productId },
        req.body.product,
        { returnOriginal: false }
      );
      await dbConnection.disconnect();
      res.status(200).json(rProduct);
    } catch (e) {
      next(e);
    }
  })();
});
router.delete("/products/:productId", (req, res, next) => {
  (async () => {
    try {
      await dbConnection.connect();
      await ProductModel.deleteOne({ _id: req.params.productId });
      await dbConnection.disconnect();
      res.status(200).json({
        messege: "OK",
      });
    } catch (e) {
      next(e);
    }
  })();
});
router.get("/products/:productId", (req, res, next) => {
  (async () => {
    try {
      await dbConnection.connect();
      const rProduct = await ProductModel.findById(req.params.productId);
      await dbConnection.disconnect();
      res.status(200).json(rProduct);
    } catch (e) {
      next(e);
    }
  })();
});
router.use((e, req, res, next) => {
  (async () => await dbConnection.disconnect())();
  console.log(e);
  if (e.name === "ValidationError") {
    res.status(400).json({
      messege: "Bad product parameters, please check your inputs and try again",
    });
    return;
  }
  if (e instanceof AuthoriseError) {
    res.status(403).json({
      messege: "Forbidden",
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

export default router;
