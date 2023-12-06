import express from "express";
import { checkUserAuthorization } from "./helpers.js";
import { DiscountModel } from "../models/DiscountModel.js";

const router = express.Router();

router.get("/discounts", checkUserAuthorization, (req, res, next) => {
  (async () => {
    try {
      const rDiscounts = await DiscountModel.find({});
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
        const rDiscount = await DiscountModel.findById(req.params.discountId);
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
      const rDiscount = await nDiscount.save();
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
        const rDiscount = await DiscountModel.findOneAndUpdate(
          { _id: req.params.discountId },
          JSON.parse(req.body.discount),
          { returnOriginal: false }
        );
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
        await DiscountModel.deleteOne({ _id: req.params.discountId });
        res.status(200).json({ messege: "OK" });
      } catch (e) {
        next(e);
      }
    })();
  }
);

export default router;
