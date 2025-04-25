import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

const useGetUserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { username } = useParams();
  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/users/user-profile/${username}`);
        const data = await res.json();
        console.log(data);
        if (data.error) {
          toast.error(data.error);
        }
        setUser(data);
      } catch (error) {
        console.log(error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, [username]);
  return { loading, user };
};
export default useGetUserProfile;
