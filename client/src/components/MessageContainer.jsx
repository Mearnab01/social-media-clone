import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Avatar,
  Box,
  Divider,
  Flex,
  Image,
  Skeleton,
  SkeletonCircle,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  conversationsAtom,
  selectedConversationAtom,
} from "../atoms/chatAtoms";
import toast from "react-hot-toast";
import Message from "./Message";
import MessageInput from "./MessageInput";
import userAtom from "../atoms/userAtom";
import { useSocket } from "../context/SocketContext";
import { formatDistanceToNow } from "date-fns";
const MessageContainer = () => {
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const [convos, setConvos] = useRecoilState(conversationsAtom);
  const [loadingMsg, setLoadingMsg] = useState(true);
  const [messages, setMessages] = useState([]);
  const currentUser = useRecoilValue(userAtom);
  const { socket } = useSocket();
  const msgEndRef = useRef(null);
  useEffect(() => {
    socket.on("newMessage", (message) => {
      //console.log(message);

      if (selectedConversation._id === message.conversationId) {
        const formattedMessage = {
          ...message,
          sentTime: formatDistanceToNow(new Date(message.sentAt), {
            addSuffix: true,
          }),
        };
        setMessages((prevMsg) => [...prevMsg, formattedMessage]);
      }
      setConvos((prev) => {
        const updatedConversations = prev.map((c) => {
          if (c._id === message.conversationId) {
            return {
              ...c,
              lastMessage: {
                text: message.text,
                sender: message.sender,
              },
            };
          }
          return c;
        });
        return updatedConversations;
      });
    });
    return () => socket.off("newMessage");
  }, [socket, selectedConversation, setConvos]);

  useEffect(() => {
    const lastMessageFromOtherUser =
      messages.length &&
      messages[messages.length - 1].sender !== currentUser._id;
    if (lastMessageFromOtherUser) {
      socket.emit("markMsgAsRead", {
        conversationId: selectedConversation._id,
        userId: selectedConversation.userId,
      });
    }
    socket.on("messageSeen", ({ conversationId }) => {
      if (selectedConversation._id === conversationId) {
        setMessages((prev) => {
          const updatedMessages = prev.map((msg) => {
            if (!msg.seen) {
              return {
                ...msg,
                seen: true,
              };
            }
            return msg;
          });
          return updatedMessages;
        });
      }
    });
  }, [socket, currentUser._id, messages, selectedConversation]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setLoadingMsg(true);
    const getMessage = async () => {
      setLoadingMsg(true);
      setMessages([]);
      try {
        if (selectedConversation.mock) {
          toast.success(
            `Start conversation with ${selectedConversation.username}`
          );
          return;
        }
        const res = await fetch(
          `/api/v1/messages/${selectedConversation.userId}`
        );
        const data = await res.json();
        const formattedMessages = data.map((d) => ({
          ...d,
          sentTime: formatDistanceToNow(new Date(d.sentAt), {
            addSuffix: true,
          }),
        }));

        if (data.error) {
          toast.error(data.error);
          return;
        }
        //console.log(data);
        setMessages(formattedMessages);
      } catch (error) {
        console.log(error.message);
        toast.error(error.message);
      } finally {
        setLoadingMsg(false);
      }
    };
    getMessage();
  }, [selectedConversation.userId, selectedConversation.mock]);
  return (
    <Flex
      flex="70"
      bg={useColorModeValue("white", "gray.800")}
      borderRadius="lg"
      p={4}
      boxShadow="md"
      flexDirection="column"
      h={"83vh"}
    >
      {/* Message Header */}
      <Flex
        w="full"
        h={14}
        alignItems="center"
        gap={3}
        p={3}
        borderBottom="1px solid"
        borderColor={useColorModeValue("gray.300", "gray.700")}
        borderRadius="lg"
        bg={useColorModeValue("gray.100", "gray.900")}
      >
        <Link
          to={`/${selectedConversation.username}`}
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            gap: "10px",
          }}
        >
          <Avatar src={selectedConversation.userProfilePic} size="md" />
          <Text
            fontWeight="bold"
            fontSize="lg"
            display="flex"
            alignItems="center"
          >
            {selectedConversation.username}
            <Image src="/verified.png" w={4} h={4} ml={2} />
          </Text>
        </Link>
      </Flex>
      <Divider />
      {/* Messages Container */}
      <Flex
        flexDir="column"
        gap={3}
        my={4}
        p={3}
        height="450px"
        overflowY="scroll"
        bg={useColorModeValue("gray.50", "gray.700")}
        borderRadius="lg"
        h={"80vh"}
      >
        {/* Loading Skeleton */}
        {loadingMsg &&
          [...Array(7)].map((_, i) => (
            <Flex
              key={i}
              gap={3}
              alignItems="center"
              p={2}
              borderRadius="xl"
              alignSelf={i % 2 === 0 ? "flex-start" : "flex-end"}
              bg={useColorModeValue("gray.200", "gray.600")}
              w="fit-content"
              maxW="80%"
              boxShadow="sm"
            >
              {i % 2 === 0 && <SkeletonCircle size={8} />}
              <Flex flexDir="column" gap={2}>
                <Skeleton h="8px" w="250px" />
                <Skeleton h="8px" w="250px" />
                <Skeleton h="8px" w="250px" />
              </Flex>
              {i % 2 !== 0 && <SkeletonCircle size={8} />}
            </Flex>
          ))}

        {/* Messages */}

        {!loadingMsg &&
          messages.map((message) => (
            <Flex
              key={message._id}
              ref={
                messages.length - 1 === messages.indexOf(message)
                  ? msgEndRef
                  : null
              }
              direction="column"
            >
              <Message
                message={message}
                sendAt={message.sentTime}
                ownMessage={currentUser?._id === message.sender}
              />
            </Flex>
          ))}
      </Flex>

      {/* Message Input */}
      <Box
        p={2}
        bg={useColorModeValue("gray.100", "gray.900")}
        borderRadius="xl"
        boxShadow="md"
        w={"100%"}
      >
        <MessageInput setMessages={setMessages} />
      </Box>
    </Flex>
  );
};

export default MessageContainer;
