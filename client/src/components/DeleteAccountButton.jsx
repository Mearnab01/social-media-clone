import { Trash2 } from "lucide-react";
import { Button } from "@chakra-ui/react";
import { data, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const DeleteAccountButton = ({ username }) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure? This cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/v1/users/${username}/delete-account`, {
        method: "DELETE",
      });
      //console.log(response);

      if (!response.ok) {
        throw new Error("Failed to delete account.");
      }

      localStorage.clear();
      navigate("/auth");
      toast.success(data.message || "Account deleted successfully.");
      window.location.reload();
    } catch (err) {
      console.error("Error deleting account:", err.message);
      toast.error(
        "An error occurred while deleting your account. Please try again."
      );
    }
  };

  return (
    <Button
      onClick={handleDelete}
      colorScheme="red"
      variant="solid"
      leftIcon={<Trash2 size={16} />}
      size="md"
      width="auto"
      marginLeft={2}
    >
      Delete Account
    </Button>
  );
};

export default DeleteAccountButton;
