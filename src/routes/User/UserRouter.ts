import express, { Request, Response } from "express";
import { ERoles, UserModel } from "../../models/UserModel.js";
import dbConnection from "../../helpers/db/dbConnection.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import AuthoriseError from "../Errors/AuthoriseError.js";

const router = express.Router();
const UPDATEABLE_FIELDS = ["email", "passowrd", "phone_num", "address"];

const getHashed = async (input: String) => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(Buffer.from(input), saltRounds);
  return hash.toString();
};
const authUser = (req, res, next) => {
  if (req.body.token) {
    const token = req.body.token;
    if (jwt.verify(token, process.env.TOKEN_SECRET)) {
      const decoded: any = jwt.decode(token);
      const tokenUser = decoded._doc;
      if (
        tokenUser._id === req.params.userId ||
        tokenUser.role === ERoles.admin
      ) {
        return next();
      }
    }
  }
  throw new AuthoriseError();
};
router.all("/users/:userId", authUser);
router.use((req, res, next) => {
  if (req.body) {
    if (req.body.email) {
      switch (req.body.email) {
        case {}:
          throw new Error("ForbiddenQuerryError: This querry is forbidden");
      }
    }
    if (req.body.password) {
      switch (req.body.password) {
        case {}:
          throw new Error("ForbiddenQuerryError: This querry is forbidden");
      }
    }
  }
  next();
});
router.get("/users/:userId", (req, res, next) => {
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
      const password = await getHashed(req.body.password);

      await dbConnection.connect();
      const user = new UserModel({
        _id: new mongoose.Types.ObjectId(),
        email: req.body.email,
        password,
      });
      await user.save();
      const newUserFromDB = await UserModel.findOne({ email: req.body.email });

      res.status(200).json(newUserFromDB);
    } catch (e) {
      next(e);
    } finally {
      await dbConnection.disconnect();
    }
  })();
});
router.post("/user/login", (req, res, next) => {
  (async () => {
    try {
      await dbConnection.connect();
      const user = await UserModel.findOne({ email: req.body.email });
      const match = bcrypt.compareSync(req.body.password, user.password);
      if (!match) {
        res.status(401).json({
          messege: "Wrong email or password",
        });
      } else {
        const token = jwt.sign({ ...user }, process.env.TOKEN_SECRET);
        res.status(200).json({
          messege: "OK",
          token,
        });
      }
    } catch (e) {
      next(e);
    } finally {
      await dbConnection.disconnect();
    }
  })();
});
router.put("/users/:userId", (req, res, next) => {
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
      res.status(200).json({ ...user });
    } catch (e) {
      next(e);
    } finally {
      await dbConnection.disconnect();
    }
  })();
});
router.delete("/users/:userId", (req, res, next) => {
  (async () => {
    try {
      await dbConnection.connect()
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

router.use((e, req, res, next) => {
  async () => await dbConnection.disconnect();
  console.log(e);
  if (e.code === 11000) {
    res.status(400).json({
      messege: "This email address is already occupied.",
    });
  }
  if (e instanceof AuthoriseError) {
    res.status(403).json({
      messege: "Forbidden",
    });
  }
  if (e) {
    res.status(500).json({
      messege: "Something went wrong, try again later.",
    });
  }
});

export default router;
