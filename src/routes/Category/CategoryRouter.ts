import express from "express";
import { checkUserAuthorization } from "../helpers/helpers.js";
import dbConnection from "../../helpers/db/dbConnection.js";
import AuthoriseError from "../Errors/AuthoriseError.js";
import { CategoryModel } from "../../models/CategoryModel.js";

const router = express.Router();

router.get("/categories", (req, res, next) => {
  (async () => {
    try {
      await dbConnection.connect();
      const rCategories = await CategoryModel.find({});
      await dbConnection.disconnect();
      res.status(200).json({ categories: rCategories });
    } catch (e) {
      next(e);
    }
  })();
});
router.get("/categoreis/:categoryId", (req, res, next) => {
  (async () => {
    try {
      await dbConnection.connect();
      const rCategory = await CategoryModel.findById(req.params.categoryId);
      await dbConnection.disconnect();
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
      await dbConnection.connect();
      const rCategory = await nCategory.save();
      await dbConnection.disconnect();
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
        await dbConnection.connect();
        const rCategory = await CategoryModel.findOneAndUpdate(
          { _id: req.params.categoryId },
          JSON.parse(req.body.category),
          { returnOriginal: false }
        );
        await dbConnection.disconnect();
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
        await dbConnection.connect();
        await CategoryModel.deleteOne({ _id: req.params.categoryId });
        await dbConnection.disconnect();
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
  if (e instanceof AuthoriseError) {
    res.status(403).json({
      messege: "Forbidden",
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

export default router;
