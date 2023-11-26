import express from "express";
import { UserModel } from "../models/UserModel.js";
import dbConnection from "../services/db/dbConnection.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import AuthoriseError from "./Errors/AuthoriseError.js";
import AuthanticateError from "./Errors/AuthanticateError.js";
import { checkUserAuthorization } from "./helpers.js";
import { createToken, deleteToken } from "../services/auth/tokens.js";

const router = express.Router();
const UPDATEABLE_FIELDS = ["email", "passowrd", "phone_num", "address"];

const getHashString = async (input: String) => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(Buffer.from(input), saltRounds);
  return hash.toString();
};

router.get("/users/:userId", checkUserAuthorization, (req, res, next) => {
  (async () => {
    try {
      await dbConnection.connect();
      const user = await UserModel.findOne({ _id: req.params.userId });
      await dbConnection.disconnect();
      res.status(200).json(user);
    } catch (e) {
      next(e);
    } finally {
      await dbConnection.disconnect();
    }
  })();
});
router.post("/user", (req, res, next) => {
  (async () => {
    try {
      const password = await getHashString(req.body.password);

      await dbConnection.connect();
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
    } finally {
      await dbConnection.disconnect();
    }
  })();
});
router.put("/user/login", (req, res, next) => {
  (async () => {
    try {
      await dbConnection.connect();
      const user = await UserModel.findOne({ email: req.body.email });
      if (!user) throw new AuthanticateError();
      const match = bcrypt.compareSync(req.body.password, user.password);
      if (!match) {
        throw new AuthanticateError();
      }
      const token = createToken(user);
      res.status(200).json({
        messege: "OK",
        token,
        user: JSON.stringify(user.toJSON()),
      });
    } catch (e) {
      next(e);
    } finally {
      await dbConnection.disconnect();
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

      await dbConnection.connect();
      const data: any = await UserModel.findOneAndUpdate(
        { _id: userId },
        updateFields,
        { returnOriginal: false }
      );
      const user = data._doc;
      res.status(200).json({ user, token: createToken(user) });
    } catch (e) {
      next(e);
    } finally {
      await dbConnection.disconnect();
    }
  })();
});
router.delete("/users/:userId", checkUserAuthorization, (req, res, next) => {
  (async () => {
    try {
      await dbConnection.connect();
      await UserModel.deleteOne({ _id: req.params.userId });
      res.status(200).json({
        messege: "OK",
      });
    } catch (e) {
      next(e);
    } finally {
      await dbConnection.disconnect();
    }
  })();
});
router.get("/users/:userId/cart", checkUserAuthorization, (req, res, next) => {
  (async () => {
    try {
      await dbConnection.connect();
      const cart = await UserModel.findOne(
        { _id: req.params.userId },
        "cart"
      ).populate("cart");
      res.status(200).json(cart);
    } catch (e) {
      next(e);
    } finally {
      dbConnection.disconnect();
    }
  })();
});
router.put("/users/:userId/cart", checkUserAuthorization, (req, res, next) => {
  (async () => {
    try {
      await dbConnection.connect();
      const nUser = UserModel.findOneAndUpdate(
        { _id: req.params.userId },
        { cart: { $contactArrays: ["$cart", req.body.items] } },
        { returnOriginal: false }
      );
      await dbConnection.disconnect();
      res.status(200).json({
        user: nUser,
        token: createToken(nUser),
      });
    } catch (e) {
      next(e);
    } finally {
      dbConnection.disconnect();
    }
  })();
});
router.delete(
  "/users/:userId/cart",
  checkUserAuthorization,
  (req, res, next) => {
    async () => {
      try {
        await dbConnection.connect();
        const nUser = await UserModel.findOneAndUpdate(
          { _id: req.params.userId },
          { cart: [] },
          { returnOriginal: false }
        );
        await dbConnection.disconnect();
        res.status(200).json({
          user: nUser,
          token: createToken(nUser),
        });
      } catch (e) {
        next(e);
      } finally {
        dbConnection.disconnect();
      }
    };
  }
);
router.put("/user/token", (req, res, next) => {
  try {
    if (req.body.token) {
      (async () => {
        const oldToken = JSON.parse(
          jwt.verify(req.body.token, process.env.TOKEN_SECRET).toString()
        );
        if (oldToken) {
          dbConnection.connect();
          const user = UserModel.findById(oldToken._id);
          const newToken = createToken(user);
          res.status(200).json({
            token: newToken,
          });
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

router.use((e, req, res, next) => {
  (async () => await dbConnection.disconnect())();
  console.log(e);
  if (e.code === 11000) {
    res.status(400).json({
      messege: "This email address is already occupied.",
    });
    return;
  }
  if (e instanceof AuthanticateError) {
    res.status(401).json({
      messege: "Incorrect email or password",
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
