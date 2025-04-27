import {
  Avatar,
  Box,
  Flex,
  Image,
  Skeleton,
  Text,
  useDisclosure,
  Button,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import React, { useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { selectedConversationAtom } from "../atoms/chatAtoms";
import { CheckCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";

const Message = ({ ownMessage, message, sendAt }) => {
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const user = useRecoilValue(userAtom);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await axios.delete("/api/v1/messages/delete", {
        data: { messageId: message._id },
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.data.success) {
        toast.success("Message deleted successfully!");
      } else {
        toast.error("Failed to delete message.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.error || "Something went wrong.");
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  const handleClickMessage = () => {
    if (ownMessage) {
      onOpen();
    }
  };

  return (
    <>
      <Flex
        flexDir="column"
        alignSelf={ownMessage ? "flex-end" : "flex-start"}
        onClick={handleClickMessage}
        onContextMenu={(e) => {
          e.preventDefault();
          handleClickMessage();
        }}
      >
        <Flex gap={2} alignItems="center" flexDir={"row"}>
          {ownMessage && message.text && (
            <Flex
              maxW="400px"
              bg="green.600"
              p={2}
              borderRadius="md"
              color="white"
              alignItems="center"
              position="relative"
            >
              <Text>{message.text}</Text>
              <Box
                ml={2}
                color={message.seen ? "blue.400" : "gray.300"}
                fontWeight="bold"
              >
                <CheckCheck size={16} />
              </Box>
            </Flex>
          )}

          {/* Render the avatar only when there is text or message img */}
          {ownMessage && !message.img && (
            <Avatar src={user.profilePic} w={7} h={7} />
          )}
        </Flex>

        {/* Message image */}
        {ownMessage && message.img && (
          <Flex mt={5} width={"350px"} gap={2} flexDirection={"row"}>
            <Box alignItems="center" justifyContent="space-between">
              <Image
                src={message.img}
                alt="message img"
                borderRadius={4}
                width="350px"
                hidden={!imgLoaded}
                onLoad={() => setImgLoaded(true)}
              />
              {!imgLoaded && <Skeleton w={"350px"} h={"200px"} />}
            </Box>
            <Avatar src={user.profilePic} w={7} h={7} />
          </Flex>
        )}

        {/* Non-own message */}
        {!ownMessage && (
          <Flex gap={2} alignItems="center">
            <Avatar src={selectedConversation.userProfilePic} w={7} h={7} />
            {message.text && (
              <Text
                maxW="350px"
                bg="#9e6cfaef"
                p={2}
                borderRadius="md"
                color="white"
              >
                {message.text}
              </Text>
            )}
            {message.img && (
              <Flex mt={5} width={"350px"}>
                <Image src={message.img} alt="message img" borderRadius={4} />
              </Flex>
            )}
          </Flex>
        )}

        <Text
          fontSize="xs"
          color="gray.400"
          textAlign={ownMessage ? "right" : "left"}
          mt={1}
          ml={ownMessage ? "0" : "40px"}
        >
          {sendAt ? sendAt : "just now"}
        </Text>
      </Flex>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Message
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this message? This action cannot
              be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDelete}
                ml={3}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default Message;
