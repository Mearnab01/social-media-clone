import {
  Avatar,
  AvatarBadge,
  Box,
  Flex,
  Stack,
  Text,
  useColorModeValue,
  WrapItem,
} from "@chakra-ui/react";
import React from "react";
import userAtom from "../atoms/userAtom";
import { CheckCheck, CircleAlert, Trash2 } from "lucide-react";
import { useRecoilValue, useRecoilState } from "recoil";
import { FileImage } from "lucide-react";
import { selectedConversationAtom } from "../atoms/chatAtoms";
const Conversations = ({ conversations, isOnline }) => {
  //from chatpage
  const user = conversations.participants[0];
  const lastMsg = conversations.lastMessage;
  const currentUser = useRecoilValue(userAtom);
  const [selectedConvo, setSelectedConvo] = useRecoilState(
    selectedConversationAtom
  );
  return (
    <Flex
      gap={4}
      alignItems={"center"}
      p={2}
      borderRadius={"md"}
      transition="background 0.2s ease-in-out"
      _hover={
        selectedConvo?._id === conversations._id
          ? { cursor: "pointer" } // No hover effect if selected
          : {
              cursor: "pointer",
              bg: useColorModeValue("gray.200", "gray.700"),
              color: "white",
            }
      }
      onClick={() =>
        setSelectedConvo({
          _id: conversations._id,
          userId: user._id,
          username: user.username,
          userProfilePic: user.profilePic,
          mock: conversations.mock,
        })
      }
      bg={selectedConvo?._id === conversations._id ? "#9a6cfe" : ""}
    >
      <WrapItem>
        <Avatar
          size={{
            base: "sm",
            sm: "md",
            md: "lg",
          }}
          src={
            user.profilePic
              ? user.profilePic
              : "https://avatars.githubusercontent.com/u/124599?v=4"
          }
          sx={{
            objectFit: "cover",
          }}
        >
          {isOnline ? <AvatarBadge boxSize="1em" bg="green.500" /> : ""}
        </Avatar>
      </WrapItem>
      <Stack direction={"column"} fontSize={"sm"}>
        <Text fontWeight="700" display={"flex"} alignItems="center">
          {user.username}
        </Text>
        <Flex fontWeight="light" fontSize="xs" gap={1} alignItems="center">
          {currentUser._id === lastMsg.sender && (
            <Box color={lastMsg.seen ? "blue.600" : ""}>
              <CheckCheck size={15} />
            </Box>
          )}
          <Text>
            {lastMsg.text && lastMsg.text.length > 18
              ? lastMsg.text.substring(0, 17) + "..."
              : lastMsg.text || <FileImage size={20} />}
          </Text>
        </Flex>
      </Stack>
    </Flex>
  );
};

export default Conversations;
