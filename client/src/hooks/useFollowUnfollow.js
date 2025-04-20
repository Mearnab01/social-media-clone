import React, { useState } from "react";
import userAtom from "../atoms/userAtom";
import { useRecoilValue } from "recoil";
import toast from "react-hot-toast";
const useFollowUnfollow = (user) => {
  const currentUser = useRecoilValue(userAtom);
  const [following, setFollowing] = useState(
    user?.followers?.includes(currentUser?._id)
  );
  const [updating, setUpdating] = useState(false);
  console.log(user);

  const handlefollowUnfollow = async () => {
    if (!currentUser) {
      toast.error("Please Login to follow");
    }
    setUpdating(true);
    try {
      const res = await fetch(`/api/v1/users/follow-unfollow/${user._id}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
      });
      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(data.message);
        console.log(data);
      }
      if (following) {
        user.followers.pop(); // simulate removing followers
      } else {
        user.followers.push(currentUser?._id); // simulate adding new followers
      }
      setFollowing(!following);
    } catch (error) {
      console.log(error.message);
      //toast.error(error.message);
    } finally {
      setUpdating(false);
    }
  };
  return { handlefollowUnfollow, updating, following };
};

export default useFollowUnfollow;
