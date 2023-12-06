import express from "express";
import { checkUserAuthorization } from "./helpers.js";
import { ReceiptModel } from "../models/ReceiptModel.js";

const router = express.Router();

router.get("/receipts", (req, res, next) => {
  (async () => {
    try {
      const rReceipt = await ReceiptModel.find({});
      res.status(200).json({ receipt: rReceipt });
    } catch (e) {
      next(e);
    }
  })();
});
router.get("/receipts/:receiptId", (req, res, next) => {
  (async () => {
    try {
      const rReceipt = await ReceiptModel.findById(req.params.receiptId);
      res.status(200).json({ receipt: rReceipt });
    } catch (e) {
      next(e);
    }
  })();
});
router.post("/receipt", checkUserAuthorization, (req, res, next) => {
  const nReceipt = new ReceiptModel(JSON.parse(req.body.receipt));
  (async () => {
    try {
      const rReceipt = await nReceipt.save();
      res.status(200).json({ receipt: rReceipt });
    } catch (e) {
      next(e);
    }
  })();
});
router.put("/receipts/:receiptId", checkUserAuthorization, (req, res, next) => {
  (async () => {
    try {
      const rReceipt = await ReceiptModel.findOneAndUpdate(
        { _id: req.params.receiptId },
        JSON.parse(req.body.receipt),
        { returnOriginal: false }
      );
      res.status(200).json({ receipt: rReceipt });
    } catch (e) {
      next(e);
    }
  })();
});
router.delete(
  "/receipts/:receiptId",
  checkUserAuthorization,
  (req, res, next) => {
    (async () => {
      try {
        await ReceiptModel.deleteOne({ _id: req.params.receiptId });
        res.status(200).json({ messege: "OK" });
      } catch (e) {
        next(e);
      }
    })();
  }
);

export default router;
