import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import notificationAtom from "../atoms/notificationAtom";

const useGetAllNotifications = () => {
  //const [notifications, setNotifications] = useState([]);
  const [notifications, setNotifications] = useRecoilState(notificationAtom);
  const [loading, setLoading] = useState(true);

  const getAllNotifications = async () => {
    try {
      const res = await fetch("/api/v1/notifications", {
        method: "GET",
        headers: {
          "content-type": "application/json",
        },
      });
      const data = await res.json();
      if (data.error) {
        console.log(data.error);
      } else {
        //console.log(data.notifications);
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllNotifications();
  }, []);

  return { loading };
};

export default useGetAllNotifications;
