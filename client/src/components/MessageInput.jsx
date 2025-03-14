import {
  Flex,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { ImagePlus, SendHorizonalIcon } from "lucide-react";
import React, { useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  conversationsAtom,
  selectedConversationAtom,
} from "../atoms/chatAtoms";
import toast from "react-hot-toast";
import usePreviewImg from "../hooks/usePreviewImg";

const MessageInput = ({ setMessages }) => {
  const [messageText, setMessageText] = useState("");
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  const imageRef = useRef(null);
  const { onClose } = useDisclosure();
  const { handleImageChange, imageUrl, setImageUrl } = usePreviewImg();
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText && !imageUrl) return;
    if (isSending) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/v1/messages`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          recipientId: selectedConversation.userId,
          img: imageUrl,
        }),
      });

      const data = await res.json();
      if (data.error) {
        console.log(data.error);
        toast.error(data.error);
        return;
      }
      //console.log("Debugging Message:", data);

      setMessages((messages) => [...messages, data]);

      setConversations((prevConvs) => {
        const updatedConversations = prevConvs.map((conversation) => {
          if (conversation._id === selectedConversation._id) {
            return {
              ...conversation,
              lastMessage: {
                text: messageText,
                sender: data.sender,
              },
            };
          }
          return conversation;
        });
        return updatedConversations;
      });
      setMessageText("");
      setImageUrl("");
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsSending(false);
    }
  };
  return (
    <Flex gap={2} alignItems={"center"}>
      <form onSubmit={handleSendMessage} style={{ flex: 95 }}>
        <InputGroup>
          <Input
            w={"full"}
            placeholder="Type a message"
            onChange={(e) => setMessageText(e.target.value)}
            value={messageText}
          />
          <InputRightElement onClick={handleSendMessage} cursor={"pointer"}>
            <SendHorizonalIcon />
          </InputRightElement>
        </InputGroup>
      </form>
      <Flex flex={5} cursor={"pointer"}>
        <ImagePlus size={20} onClick={() => imageRef.current.click()} />
        <Input
          type={"file"}
          hidden
          ref={imageRef}
          onChange={handleImageChange}
        />
      </Flex>
      <Modal
        isOpen={imageUrl}
        onClose={() => {
          onClose();
          setImageUrl("");
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex mt={5} w={"full"}>
              <Image src={imageUrl} />
            </Flex>
            <Flex justifyContent={"flex-end"} my={2}>
              {!isSending ? (
                <SendHorizonalIcon
                  size={24}
                  cursor={"pointer"}
                  onClick={handleSendMessage}
                />
              ) : (
                <Spinner size={"md"} />
              )}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default MessageInput;
