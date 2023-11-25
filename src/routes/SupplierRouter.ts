import express from "express";
import { checkUserAuthorization } from "./helpers.js";
import dbConnection from "../services/db/dbConnection.js";
import { SupplierModel } from "../models/SupplierModel.js";
import AuthoriseError from "./Errors/AuthoriseError.js";
import jwt from 'jsonwebtoken';
const router = express.Router();

router.put("/suppliers", checkUserAuthorization, (req, res, next) => {
  (async () => {
    try {
      await dbConnection.connect();
      const rSuppliers = await SupplierModel.find({});
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
  const nSupplier = new SupplierModel(JSON.parse(req.body.supplier));
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
          JSON.parse(req.body.supplier),
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
  if(e instanceof jwt.TokenExpiredError){
    res.status(401).json({
      messege: "Token Expired"
    })
  }
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
