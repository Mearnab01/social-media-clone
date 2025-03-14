import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import toast from "react-hot-toast";

const useLogOut = () => {
  const setUser = useSetRecoilState(userAtom);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/v1/users/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      localStorage.removeItem("user-threads");
      setUser(null);
      toast.success(data.message);
      navigate("/auth");
    } catch (error) {
      console.log("Error from Logout:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return handleLogout;
};

export default useLogOut;
