import express from "express";
import { ProductModel } from "../models/ProductModel.js";
import { checkUserAuthorization } from "./helpers.js";
import awsProducts from "../services/db/awsProducts.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.get("/products", async (req, res, next) => {
  const qOffset = req.query.offset || "0";
  const qLimit = req.query.limit || "10";
  if (typeof qOffset === "string" && typeof qLimit === "string") {
    const offset = parseInt(qOffset) || 0;
    let limit = parseInt(qLimit) || 10;

    limit > 10 && (limit = 10); // Force a limit of 10 items

    try {
      const productRes = await ProductModel.find({})
        .skip(offset)
        .limit(limit)
        .populate("supplier");

      const rProducts = [];
      for (let p of productRes) {
        const images = await awsProducts.getImageUrls(p._id.toString());
        rProducts.push({ ...p.toObject(), images });
      }
      res.status(200).json(rProducts);
    } catch (e) {
      next(e);
    }
  }
});
router.post(
  "/product",
  checkUserAuthorization,
  upload.array("images"),
  async (req: any, res, next) => {
    {
      try {
        const product = await JSON.parse(req.body.product);
        const nProduct = new ProductModel(product);
        const rProduct = await nProduct.save();

        if (req.files && req.files instanceof Array) {
          for (let p of req.files) {
            awsProducts.uploadImage(nProduct._id.toString(), p);
          }
        } else
          res.status(200).json({
            product: rProduct.toObject(),
          });
      } catch (e) {
        next(e);
      }
    }
  }
);
router.put("/products/:productId", checkUserAuthorization, (req, res, next) => {
  (async () => {
    try {
      const rProduct = await ProductModel.findOneAndUpdate(
        { _id: req.params.productId },
        JSON.parse(req.body.product),
        { returnOriginal: false }
      );
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
        await ProductModel.deleteOne({ _id: req.params.productId });
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
      const rProduct = await ProductModel.findById(req.params.productId);
      res.status(200).json(rProduct);
    } catch (e) {
      next(e);
    }
  })();
});
router.get("/products/:productId/images", async (req, res, next) => {
  try {
    const urls = await awsProducts.getImageUrls(req.params.productId);
    res.status(200).json(urls);
  } catch (e) {
    next(e);
  }
});
router.post(
  "/products/:productId/image",
  checkUserAuthorization,
  upload.single("image"),
  (req, res, next) => {
    const image = req.file;
    try {
      awsProducts
        .uploadImage(req.params.productId, image)
        .then((url) => res.status(200).send(url));
    } catch (e) {
      next(e);
    }
  }
);

export default router;
