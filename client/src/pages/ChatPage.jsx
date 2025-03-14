import {
  Box,
  Button,
  Flex,
  Input,
  Skeleton,
  SkeletonCircle,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { MessageSquareMore, Search } from "lucide-react";
import toast from "react-hot-toast";
import Conversations from "../components/Conversations";
import MessageContainer from "../components/MessageContainer";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  conversationsAtom,
  selectedConversationAtom,
} from "../atoms/chatAtoms";
import userAtom from "../atoms/userAtom";
import { useSocket } from "../context/SocketContext";
const ChatPage = () => {
  const currentUser = useRecoilValue(userAtom);
  const { socket, onlineUsers } = useSocket();
  const [loadingChat, setLoadingChat] = useState(true);
  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  const [selectedConvo, setSelectedConvo] = useRecoilState(
    selectedConversationAtom
  );
  const [searchText, setSearchText] = useState("");
  const [searchingUser, setSearchingUser] = useState(false);

  useEffect(() => {
    socket?.on("messageSeen", ({ conversationId }) => {
      setConversations((prev) => {
        const updatedConversation = prev.map((conversation) => {
          if (conversation._id === conversationId) {
            return {
              ...conversation,
              lastMessage: {
                ...conversation.lastMessage,
                seen: true,
              },
            };
          }
          return conversation;
        });
        return updatedConversation;
      });
    });
  }, [socket, setConversations]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await fetch("/api/v1/messages/conversations");
        const data = await res.json();

        if (data.error) {
          toast.error(data.error);
          return;
        }

        setConversations(data);
      } catch (error) {
        toast.error(error.message);
        console.log("Fetch Error:", error);
      } finally {
        setLoadingChat(false);
      }
    };

    getMessages();
  }, [setConversations]);

  const handleConversationSearch = async (e) => {
    e.preventDefault();
    setSearchingUser(true);
    try {
      const res = await fetch(`/api/v1/users/user-profile/${searchText}`);
      const searchedUser = await res.json();

      if (searchedUser.error) {
        return toast.error(searchedUser.error);
      }
      if (currentUser._id === searchedUser._id) {
        return toast.error("You Cannot mesage yourself");
      }
      const convoAlreadyExists = conversations.find(
        (conversation) => conversation.participants[0]._id === searchedUser._id
      );
      if (convoAlreadyExists) {
        setSelectedConvo({
          _id: convoAlreadyExists._id,
          userId: searchedUser._id,
          username: searchedUser.username,
          userProfilePic: searchedUser.profilePic,
        });
        return;
      }

      const mockConversations = {
        mock: true,
        lastMessage: {
          text: "",
          sender: "",
        },
        _id: Date.now(),
        participants: [
          {
            _id: searchedUser._id,
            username: searchedUser.username,
            profilePic: searchedUser.profilePic,
          },
        ],
      };
      setConversations((prevConvos) => [...prevConvos, mockConversations]);
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    } finally {
      setSearchingUser(false);
    }
  };
  return (
    <Box
      position={"absolute"}
      w={{ base: "100%", md: "80%", lg: "1250px" }}
      left={"50%"}
      transform={"translateX(-50%)"}
      //border={"5px solid red"}
      h={"85vh"}
    >
      <Flex
        gap={4}
        flexDirection={{
          base: "column",
          md: "row",
        }}
        maxW={{ sm: "400px", md: "full" }}
        mx={"auto"}
      >
        <Flex
          flex={30}
          gap={2}
          flexDirection={"column"}
          maxW={{ sm: "250px", md: "full" }}
          mx={"auto"}
        >
          <Text
            fontWeight={700}
            color={useColorModeValue("gray.600", "gray.400")}
            mx={"auto"}
          >
            Your Conversations
          </Text>
          <form onSubmit={handleConversationSearch}>
            <Flex alignItems="center" gap={2} p={2} rounded="lg">
              <Input
                placeholder="Search for a user..."
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
                size="md"
                rounded="full"
                focusBorderColor="blue.400"
              />
              <Button
                size="md"
                colorScheme="blue"
                rounded="full"
                px={3}
                type="submit"
                onClick={handleConversationSearch}
                isLoading={searchingUser}
              >
                <Search size={18} />
              </Button>
            </Flex>
          </form>
          {loadingChat &&
            [0, 1, 2, 3, 4].map((_, i) => (
              <Flex
                key={i}
                gap={4}
                alignItems={"center"}
                p={"1"}
                borderRadius={"md"}
              >
                <Box>
                  <SkeletonCircle size={"10"} />
                </Box>
                <Flex w={"full"} flexDirection={"column"} gap={3}>
                  <Skeleton h={"10px"} w={"80px"} />
                  <Skeleton h={"8px"} w={"90%"} />
                </Flex>
              </Flex>
            ))}
          {!loadingChat && conversations?.length > 0 ? (
            conversations.map((conv) => (
              <Conversations
                key={conv._id}
                isOnline={onlineUsers.includes(conv.participants[0]._id)}
                conversations={conv}
              />
            ))
          ) : (
            <Text textAlign="center" color="gray.500">
              No conversations found
            </Text>
          )}
        </Flex>
        {!selectedConvo._id && (
          <Flex
            flex={70}
            borderRadius={"md"}
            p={2}
            flexDir={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            height={"400px"}
          >
            <MessageSquareMore size={100} />
            <Text fontSize={20}>Select a conversation to start messaging</Text>
          </Flex>
        )}
        {selectedConvo._id && <MessageContainer />}
      </Flex>
    </Box>
  );
};

export default ChatPage;
