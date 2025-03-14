import { useState } from "react";
import toast from "react-hot-toast";

const usePreviewImg = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("invalid file type, Please select a image file");
      setImageUrl(null);
    }
  };
  //console.log(imageUrl);

  return { handleImageChange, imageUrl, setImageUrl };
};

export default usePreviewImg;
