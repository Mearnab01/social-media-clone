import { AddIcon } from "@chakra-ui/icons";
import { ImagePlus } from "lucide-react";
import {
  Button,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  Textarea,
  Text,
  Input,
  Flex,
  Image,
  CloseButton,
} from "@chakra-ui/react";
import React, { useRef, useState } from "react";
import usePreviewImg from "../hooks/usePreviewImg";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import toast from "react-hot-toast";
import postAtom from "../atoms/postAtom";
import { useParams } from "react-router-dom";

const MAX_CHAR = 500;
const CreatePost = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { username } = useParams();
  const { handleImageChange, imageUrl, setImageUrl } = usePreviewImg();
  const [postText, setPostText] = useState("");
  const [posts, setPosts] = useRecoilState(postAtom);
  const [loading, setLoading] = useState(false);
  const [remainingChars, setRemainingChars] = useState(MAX_CHAR);
  const imageRef = useRef(null);
  const user = useRecoilValue(userAtom);

  const handleTextChange = (e) => {
    const inputText = e.target.value;

    if (inputText.length > MAX_CHAR) {
      const truncatedText = inputText.slice(0, MAX_CHAR);
      setPostText(truncatedText);
      setRemainingChars(0);
    } else {
      setPostText(inputText);
      setRemainingChars(MAX_CHAR - inputText.length);
    }
  };
  const handleCreatePost = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/posts/create`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          postedBy: user._id,
          text: postText,
          img: imageUrl,
        }),
      });
      const data = await res.json();
      console.log(data);
      if (data.error) {
        toast.error(data.error);
        console.log(data.error);
      }
      onClose();
      setPostText("");
      setImageUrl("");
      if (username === user.username) {
        toast.success("Post created successfully");
        setPosts([data, ...posts]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {/* {username === user.username} */}

      <Button
        position={"fixed"}
        bottom={10}
        right={10}
        leftIcon={<AddIcon />}
        bg={useColorModeValue("gray.300", "gray.dark")}
        onClick={onOpen}
      >
        Add Post
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <Textarea
                placeholder="post content goes here..."
                onChange={handleTextChange}
                value={postText}
                isRequired
              />
              <Text
                fontSize="sm"
                textAlign={"right"}
                color={"white"}
                m={"1"}
                fontWeight="bold"
              >
                {remainingChars}/{MAX_CHAR}
              </Text>
              <Input
                type="file"
                hidden
                ref={imageRef}
                onChange={handleImageChange}
              />
              <ImagePlus
                style={{
                  marginLeft: "5px",
                  cursor: "pointer",
                  backgroundColor: "gray.light",
                }}
                size={16}
                onClick={() => imageRef.current.click()}
              />
              {imageUrl && (
                <Flex mt={5} w={"full"} position={"relative"}>
                  <Image
                    src={imageUrl}
                    alt="Selected Image"
                    maxW="300px" // Set max width
                    maxH="300px" // Set max height
                    objectFit="contain" // Ensure the image fits within bounds
                    borderRadius="md"
                    boxShadow="md"
                  />
                  <CloseButton
                    onClick={() => {
                      setImageUrl("");
                    }}
                    bg={"gray.700"}
                    position={"absolute"}
                    top={2}
                    right={2}
                  />
                </Flex>
              )}
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="green"
              mr={3}
              isLoading={loading}
              onClick={handleCreatePost}
            >
              Post
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreatePost;
