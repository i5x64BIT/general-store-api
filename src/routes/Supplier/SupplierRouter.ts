import express from "express";
import { checkUserAuthorization } from "../helpers/helpers.js";
import dbConnection from "../../helpers/db/dbConnection.js";
import { SupplierModel } from "../../models/SupplierModel.js";
import AuthoriseError from "../Errors/AuthoriseError.js";

const router = express.Router();

router.get("/suppliers", checkUserAuthorization, (req, res, next) => {
  (async () => {
    try {
      await dbConnection.connect();
      const rSupplier = await SupplierModel.find({});
      await dbConnection.disconnect();
      res.status(200).json({ supplier: rSupplier });
    } catch (e) {
      next(e);
    }
  })();
});
router.get(
  "/suppliers/:supplierId",
  checkUserAuthorization,
  (req, res, next) => {
    (async () => {
      try {
        await dbConnection.connect();
        const rSupplier = await SupplierModel.findById(req.params.supplierId);
        await dbConnection.disconnect();
        res.status(200).json({ supplier: rSupplier });
      } catch (e) {
        next(e);
      }
    })();
  }
);
router.post("/supplier", checkUserAuthorization, (req, res, next) => {
  const nSupplier = new SupplierModel(req.body.supplier);
  (async () => {
    try {
      await dbConnection.connect();
      const rSupplier = await nSupplier.save();
      await dbConnection.disconnect();
      res.status(200).json({ supplier: rSupplier });
    } catch (e) {
      next(e);
    }
  })();
});
router.put(
  "/suppliers/:supplierId",
  checkUserAuthorization,
  (req, res, next) => {
    (async () => {
      try {
        await dbConnection.connect();
        const rSupplier = await SupplierModel.findOneAndUpdate(
          { _id: req.params.supplierId },
          req.body.supplier,
          { returnOriginal: false }
        );
        await dbConnection.disconnect();
        res.status(200).json({ supplier: rSupplier });
      } catch (e) {
        next(e);
      }
    })();
  }
);
router.delete(
  "/suppliers/:supplierId",
  checkUserAuthorization,
  (req, res, next) => {
    (async () => {
      try {
        await dbConnection.connect();
        await SupplierModel.deleteOne({ _id: req.params.supplierId });
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
  if (e) {
    res.status(500).json({
      messege: "Something went wrong, try again later.",
    });
    return;
  }
});

export default router;