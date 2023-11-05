import express from "express";
import { checkUserAuthorization } from "../helpers/helpers.js";
import dbConnection from "../../helpers/db/dbConnection.js";
import AuthoriseError from "../Errors/AuthoriseError.js";
import { ReceiptModel } from "../../models/ReceiptModel.js";

const router = express.Router();

router.get("/receipts", (req, res, next) => {
  (async () => {
    try {
      await dbConnection.connect();
      const rReceipt = await ReceiptModel.find({});
      await dbConnection.disconnect();
      res.status(200).json({ receipt: rReceipt });
    } catch (e) {
      next(e);
    }
  })();
});
router.get("/receipts/:receiptId", (req, res, next) => {
  (async () => {
    try {
      await dbConnection.connect();
      const rReceipt = await ReceiptModel.findById(req.params.receiptId);
      await dbConnection.disconnect();
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
      await dbConnection.connect();
      const rReceipt = await nReceipt.save();
      await dbConnection.disconnect();
      res.status(200).json({ receipt: rReceipt });
    } catch (e) {
      next(e);
    }
  })();
});
router.put("/receipts/:receiptId", checkUserAuthorization, (req, res, next) => {
  (async () => {
    try {
      await dbConnection.connect();
      const rReceipt = await ReceiptModel.findOneAndUpdate(
        { _id: req.params.receiptId },
        JSON.parse(req.body.receipt),
        { returnOriginal: false }
      );
      await dbConnection.disconnect();
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
        await dbConnection.connect();
        await ReceiptModel.deleteOne({ _id: req.params.receiptId });
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
