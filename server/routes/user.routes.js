import express from "express";
import {
  followUnfollowUser,
  getSuggestedUser,
  getUser,
  logoutUser,
  updateUser,
  userLogin,
  userSignup,
} from "../controllers/user.controller.js";
import isAuth from "../middlewares/isAuth.js";
const router = express.Router();

router.get("/user-profile/:query", getUser);
router.post("/signup", userSignup);
router.post("/login", userLogin);
router.post("/logout", logoutUser);
router.put("/update-user/:id", isAuth, updateUser);
router.get("/suggested-user", isAuth, getSuggestedUser);
router.post("/follow-unfollow/:id", isAuth, followUnfollowUser);
export default router;
