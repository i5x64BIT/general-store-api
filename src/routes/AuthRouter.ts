import express from "express";
import { UserModel } from "../models/UserModel.js";
import AuthanticateError from "./Errors/AuthanticateError.js";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import AuthoriseError from "./Errors/AuthoriseError.js";

const router = express.Router();

const secret = process.env.TOKEN_SECRET || "pink-turtle";
const createToken = (payload: any, timeout: string | number = 900) => {
  const options: jwt.SignOptions = { algorithm: "HS256", expiresIn: "15m" };
  const token = jwt.sign({ ...payload }, secret, options);
  return token;
};

router.put("/login", (req, res, next) => {
  UserModel.findOne({ email: req.body.email }).then((user) => {
    if (!user) return next(new AuthanticateError());
    const match = bcrypt.compareSync(req.body.password, user.password);
    if (!match) {
      return next(new AuthanticateError());
    }
    const { _id, email, role, address, phone_num, cart, receipts } = user;
    const accessToken = createToken({
      _id,
      role,
    });
    const refreshToken = createToken({
      _id,
      role,
    });
    user.refreshToken = refreshToken;
    user.save();
    res.cookie("token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24,
    });
    res.status(200).json({
      messege: "OK",
      token: accessToken,
      user: JSON.stringify({
        _id,
        email,
        role,
        address,
        phone_num,
        cart,
        receipts,
      }),
    });
  });
});
router.put("/refresh", async (req, res, next) => {
  if(req.cookies?.token){
  try {
    const decoded = jwt.verify(
      req.cookies.token,
      process.env.TOKEN_SECRET
    ) as JwtPayload;
    const user = await UserModel.findOne({ refreshToken: req.cookies.token });
    if (!user) {
      // Duplicate use for key
      const hackedUser = await UserModel.findById(decoded._id);
      hackedUser.refreshToken = "";
      hackedUser.save();
      return next(
        new AuthanticateError("Something wen't wrong, please re-login")
      );
    } else {
      const newRefreshToken = createToken(
        {
          _id: user._id,
          role: user.role,
        },
        "1d"
      );
      const newAccessToken = createToken({
        _id: user._id,
        role: user.role,
      });
      user.refreshToken = newRefreshToken;
      user.save();
      res.cookie("token", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
      res.status(200).send({
        messege: "OK",
        token: newAccessToken,
      });
    }
  } catch (error) {
    // jwt error
    const decoded = jwt.decode(req.cookies?.token) as JwtPayload;
    if (!decoded) {
      return next(new AuthoriseError("Bad Token or missing Token"));
    } else {
      // Refresh Token Expired
      const expiredUser = await UserModel.findById(decoded._id);
      expiredUser.refreshToken = "";
      expiredUser.save();
      return next(new AuthanticateError("Token Expired"));
    }
  }
} else{
  console.log("Missing token request")
  res.status(401).json({
    messege: "Missing refresh token"
  })
}
});
router.put("/logout", async (req, res, next) => {
  try {
    const decoded : any = jwt.verify(req.cookies.token, process.env.TOKEN_SECRET);
    const user = await UserModel.findById(decoded._id);
    user.refreshToken = "";
    user.save();
    res.status(200).json({
      messege: "Logged Out successfully"
    })
  } catch (error) {
    //JWT is not valid
    res.status(401).json({
      messege: "Unauthorized",
    });
  }
});

export default router;
