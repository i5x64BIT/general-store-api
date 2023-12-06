import express from "express";
import { checkUserAuthorization } from "./helpers.js";
import { CategoryModel } from "../models/CategoryModel.js";

const router = express.Router();

router.get("/categories", (req, res, next) => {
  (async () => {
    try {
      const rCategories = await CategoryModel.find({});
      res.status(200).json({ categories: rCategories });
    } catch (e) {
      next(e);
    }
  })();
});
router.get("/categoreis/:categoryId", (req, res, next) => {
  (async () => {
    try {
      const rCategory = await CategoryModel.findById(req.params.categoryId);
      res.status(200).json({ category: rCategory });
    } catch (e) {
      next(e);
    }
  })();
});
router.post("/category", checkUserAuthorization, (req, res, next) => {
  const nCategory = new CategoryModel(JSON.parse(req.body.category));
  (async () => {
    try {
      const rCategory = await nCategory.save();
      res.status(200).json({ category: rCategory });
    } catch (e) {
      next(e);
    }
  })();
});
router.put(
  "/categories/:categoryId",
  checkUserAuthorization,
  (req, res, next) => {
    (async () => {
      try {
        const rCategory = await CategoryModel.findOneAndUpdate(
          { _id: req.params.categoryId },
          JSON.parse(req.body.category),
          { returnOriginal: false }
        );
        res.status(200).json({ category: rCategory });
      } catch (e) {
        next(e);
      }
    })();
  }
);
router.delete(
  "/categories/:categoryId",
  checkUserAuthorization,
  (req, res, next) => {
    (async () => {
      try {
        await CategoryModel.deleteOne({ _id: req.params.categoryId });
        res.status(200).json({ messege: "OK" });
      } catch (e) {
        next(e);
      }
    })();
  }
);

export default router;
