import express from "express";
import dbConnection from "../services/db/dbConnection.js";
import AuthoriseError from "./Errors/AuthoriseError.js";
import { IProduct, ProductModel } from "../models/ProductModel.js";
import { checkUserAuthorization } from "./helpers.js";
import awsRequests from "../services/db/awsRequests.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

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
      const productRes = await ProductModel.find({})
        .skip(offset)
        .limit(limit)
        .populate("supplier");
      const data: any = Array.from(productRes);
      const rProducts = [];
      for (let p of data) {
        const images = await awsRequests.getImagesOfProduct(p._id);
        rProducts.push({ ...p._doc, images });
      }
      await dbConnection.disconnect();
      res.status(200).json(rProducts);
    } catch (e) {
      next(e);
    }
  })();
});
router.post(
  "/product",
  checkUserAuthorization,
  upload.array("images"),
  (req: any, res, next) => {
    (async () => {
      try {
        const product = await JSON.parse(req.body.product);
        const nProduct = new ProductModel(product);
        const token = req.headers.authorization.split(" ")[1];
        await dbConnection.connect();
        const rProduct = await nProduct.save();
        await dbConnection.disconnect();
        if (req.files && req.files instanceof Array) {
          awsRequests.addImagesToProduct(nProduct._id, req.files, token);
        }
        res.status(200).json({
          product: rProduct,
        });
      } catch (e) {
        next(e);
      }
    })();
  }
);
router.put("/products/:productId", checkUserAuthorization, (req, res, next) => {
  (async () => {
    try {
      await dbConnection.connect();
      const rProduct = await ProductModel.findOneAndUpdate(
        { _id: req.params.productId },
        JSON.parse(req.body.product),
        { returnOriginal: false }
      );
      await dbConnection.disconnect();
      res.status(200).json(rProduct);
    } catch (e) {
      next(e);
    }
  })();
});
router.delete(
  "/products/:productId",
  checkUserAuthorization,
  (req, res, next) => {
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
  }
);
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
router.get("/products/:productId/images", (req, res, next) => {
  (async () => {
    try {
      const urls = await awsRequests.getImagesOfProduct(req.params.productId);
      res.status(200).json(urls);
    } catch (e) {
      next(e);
    }
  })();
});
router.post(
  "/products/:productId/images",
  checkUserAuthorization,
  (req, res, next) => {
    console.log(req.body);
    const images = req.body.file;
    const token = req.headers.authorization.split(" ")[1];
    (async () => {
      try {
        await awsRequests.addImagesToProduct(
          req.params.productId,
          images,
          token
        );
        res.status(200).json({ messege: "OK" });
      } catch (e) {
        next(e);
      }
    })();
  }
);
router.use((e, req, res, next) => {
  (async () => await dbConnection.disconnect())();
  console.log(e);
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
