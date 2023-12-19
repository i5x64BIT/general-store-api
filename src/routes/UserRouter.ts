import express from "express";
import { UserModel } from "../models/UserModel.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { checkUserAuthorization } from "./helpers.js";
import { createToken, deleteToken } from "../services/auth/tokens.js";

const router = express.Router();
const UPDATEABLE_FIELDS = ["email", "passowrd", "phone_num", "address"];

const getHashString = async (input: String) => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(Buffer.from(input), saltRounds);
  return hash.toString();
};

router.get("/users", checkUserAuthorization, async (req, res, next) => {
  try {
    const users = await UserModel.find({});
    res.status(200).json(users);
  } catch (e) {
    next(e);
  }
});
router.get("/users/:userId", checkUserAuthorization, (req, res, next) => {
  (async () => {
    try {
      const user = await UserModel.findOne({ _id: req.params.userId });
      res.status(200).json(user);
    } catch (e) {
      next(e);
    }
  })();
});
router.post("/user", (req, res, next) => {
  (async () => {
    try {
      const password = await getHashString(req.body.password);

      const user = new UserModel({
        _id: new mongoose.Types.ObjectId(),
        email: req.body.email,
        password,
      });
      await user.save();
      const newUserFromDB = await UserModel.findOne({ email: req.body.email });

      res.status(200).json({
        user: newUserFromDB,
        token: createToken(newUserFromDB),
      });
    } catch (e) {
      next(e);
    }
  })();
});
router.put("/users/:userId", checkUserAuthorization, (req, res, next) => {
  const updateFields: any = {};
  UPDATEABLE_FIELDS.forEach((f) => {
    if (req.body[f]) {
      if (req.body[f]) updateFields[f] = req.body[f];
    }
  });

  (async () => {
    try {
      const token: any = jwt.decode(req.body.token);
      const userId = token._doc._id;

      const data: any = await UserModel.findOneAndUpdate(
        { _id: userId },
        updateFields,
        { returnOriginal: false }
      );
      const user = data._doc;
      res.status(200).json({ user, token: createToken(user) });
    } catch (e) {
      next(e);
    }
  })();
});
router.delete("/users/:userId", checkUserAuthorization, (req, res, next) => {
  (async () => {
    try {
      await UserModel.deleteOne({ _id: req.params.userId });
      res.status(200).json({
        messege: "OK",
      });
    } catch (e) {
      next(e);
    }
  })();
});
router.get("/users/:userId/cart", checkUserAuthorization, (req, res, next) => {
  (async () => {
    try {
      const cart = await UserModel.findOne(
        { _id: req.params.userId },
        "cart"
      ).populate("cart");
      res.status(200).json(cart);
    } catch (e) {
      next(e);
    }
  })();
});
router.put("/users/:userId/cart", checkUserAuthorization, (req, res, next) => {
  (async () => {
    try {
      const nUser = UserModel.findOneAndUpdate(
        { _id: req.params.userId },
        { cart: { $contactArrays: ["$cart", req.body.items] } },
        { returnOriginal: false }
      );
      res.status(200).json({
        user: nUser,
        token: createToken(nUser),
      });
    } catch (e) {
      next(e);
    }
  })();
});
router.delete(
  "/users/:userId/cart",
  checkUserAuthorization,
  (req, res, next) => {
    async () => {
      try {
        const nUser = await UserModel.findOneAndUpdate(
          { _id: req.params.userId },
          { cart: [] },
          { returnOriginal: false }
        );
        res.status(200).json({
          user: nUser,
          token: createToken(nUser),
        });
      } catch (e) {
        next(e);
      }
    };
  }
);
router.put("/user/token", (req, res, next) => {
  try {
    if (req.body.token) {
      (async () => {
        try {
          const payload = jwt.verify(
            req.body.token,
            process.env.TOKEN_SECRET
          ) as jwt.JwtPayload;
          if (payload) {
            const oldToken = payload._doc;
            const user = UserModel.findById(oldToken._id);
            const newToken = createToken(user);
            res.status(200).json({
              token: newToken,
            });
          }
        } catch (e) {
          next(e);
        }
      })();
    }
  } catch (e) {
    next(e);
  }
});
router.delete("/user/token", (req, res, next) => {
  try {
    if (req.body.token) {
      (async () => {
        if (req.body.token) {
          deleteToken(req.body.token);
          res.status(200).json({
            messege: "OK",
          });
        }
      })();
    } else {
      throw new Error("Missing Token");
    }
  } catch (e) {
    next(e);
  }
});

export default router;
