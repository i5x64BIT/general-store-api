import express from "express";
import { checkUserAuthorization } from "./helpers.js";
import dbConnection from "../services/db/dbConnection.js";
import AuthoriseError from "./Errors/AuthoriseError.js";
import { DiscountModel } from "../models/DiscountModel.js";

const router = express.Router();

router.get("/discounts", checkUserAuthorization, (req, res, next) => {
  (async () => {
    try {
      await dbConnection.connect();
      const rDiscounts = await DiscountModel.find({});
      await dbConnection.disconnect();
      res.status(200).json({ discounts: rDiscounts });
    } catch (e) {
      next(e);
    }
  })();
});
router.get(
  "/discounts/:discountId",
  checkUserAuthorization,
  (req, res, next) => {
    (async () => {
      try {
        await dbConnection.connect();
        const rDiscount = await DiscountModel.findById(req.params.discountId);
        await dbConnection.disconnect();
        res.status(200).json({ discount: rDiscount });
      } catch (e) {
        next(e);
      }
    })();
  }
);
router.post("/discount", checkUserAuthorization, (req, res, next) => {
  const nDiscount = new DiscountModel(JSON.parse(req.body.discount));
  (async () => {
    try {
      await dbConnection.connect();
      const rDiscount = await nDiscount.save();
      await dbConnection.disconnect();
      res.status(200).json({ discount: rDiscount });
    } catch (e) {
      next(e);
    }
  })();
});
router.put(
  "/discounts/:discountId",
  checkUserAuthorization,
  (req, res, next) => {
    (async () => {
      try {
        await dbConnection.connect();
        const rDiscount = await DiscountModel.findOneAndUpdate(
          { _id: req.params.discountId },
          JSON.parse(req.body.discount),
          { returnOriginal: false }
        );
        await dbConnection.disconnect();
        res.status(200).json({ discount: rDiscount });
      } catch (e) {
        next(e);
      }
    })();
  }
);
router.delete(
  "/discounts/:discountId",
  checkUserAuthorization,
  (req, res, next) => {
    (async () => {
      try {
        await dbConnection.connect();
        await DiscountModel.deleteOne({ _id: req.params.discountId });
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
