import express from "express";
import {
  deleteAccount,
  followUnfollowUser,
  getFollowers,
  getFollowing,
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

router.get("/:username/followers", isAuth, getFollowers);
router.get("/:username/following", isAuth, getFollowing);
router.delete("/:username/delete-account", deleteAccount);

export default router;
