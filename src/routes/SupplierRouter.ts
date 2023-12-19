import express from "express";
import { checkUserAuthorization } from "./helpers.js";
import { SupplierModel } from "../models/SupplierModel.js";
const router = express.Router();

router.get("/suppliers", checkUserAuthorization, (req, res, next) => {
  (async () => {
    try {
      const rSuppliers = await SupplierModel.find({}).populate("contact");
      res.status(200).json({ suppliers: rSuppliers });
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
        const rSupplier = await SupplierModel.findById(req.params.supplierId);
        res.status(200).json({ supplier: rSupplier });
      } catch (e) {
        next(e);
      }
    })();
  }
);
router.post("/supplier", checkUserAuthorization, (req, res, next) => {
  const nSupplier = new SupplierModel(JSON.parse(req.body.supplier));
  (async () => {
    try {
      const rSupplier = await nSupplier.save();
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
        const rSupplier = await SupplierModel.findOneAndUpdate(
          { _id: req.params.supplierId },
          JSON.parse(req.body.supplier),
          { returnOriginal: false }
        );
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
        await SupplierModel.deleteOne({ _id: req.params.supplierId });
        res.status(200).json({ messege: "OK" });
      } catch (e) {
        next(e);
      }
    })();
  }
);

export default router;
