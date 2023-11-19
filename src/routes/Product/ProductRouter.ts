import express from "express";
import dbConnection from "../../helpers/db/dbConnection.js";
import AuthoriseError from "../Errors/AuthoriseError.js";
import { IProduct, ProductModel } from "../../models/ProductModel.js";
import { checkUserAuthorization } from "../helpers/helpers.js";
import {
  addImagesToProduct,
  getImagesOfProduct,
} from "../../helpers/db/awsRequests.js";

const router = express.Router();

interface IRequestProduct extends IProduct {
  images?: Buffer[];
}
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
router.post("/product", checkUserAuthorization, (req, res, next) => {
  const product: IRequestProduct = JSON.parse(req.body.product);
  const nProduct = new ProductModel(product);
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
      const urls = await getImagesOfProduct(req.params.productId);
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
    const product: IRequestProduct = req.body.product;
    (async () => {
      try {
        await addImagesToProduct(product._id, product.images, req.body.token);
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
