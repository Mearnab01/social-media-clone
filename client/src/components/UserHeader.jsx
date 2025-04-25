import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Instagram, MoreHorizontal } from "lucide-react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import useFollowUnfollow from "../hooks/useFollowUnfollow";
import DeleteAccountButton from "./DeleteAccountButton";

const UserHeader = ({ user }) => {
  const currentUser = useRecoilValue(userAtom);
  const { handlefollowUnfollow, following, updating } = useFollowUnfollow(user);

  const copyURL = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      toast({
        position: "top-right",
        render: () => (
          <Box color="white" p={3} bg="gray.light" rounded={"md"}>
            URL copied to clipboard
          </Box>
        ),
      });
    });
  };
  return (
    <VStack gap={4} alignItems={"start"}>
      <Flex justifyContent={"space-between"} w={"full"}>
        <Box>
          {/* name */}
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            {user.name}
          </Text>
          <Flex gap={2} alignItems={"center"}>
            <Text fontSize={"sm"}>{user.username}</Text>
            <Text
              fontSize={"xs"}
              bg={"gray.dark"}
              color={"gray.light"}
              p={1}
              rounded={"full"}
            >
              Posts: <span color="white">{user.postCount}</span>
            </Text>
          </Flex>
        </Box>
        <Box>
          {/* image */}
          {user.profilePic ? (
            <Avatar
              name={user.username}
              src={user.profilePic}
              sx={{
                img: {
                  objectFit: "contain",
                },
              }}
              size={{ base: "xl" }}
            />
          ) : (
            <Avatar
              name="user-avatar"
              src="https://avatars.githubusercontent.com/u/124599?v=4"
              sx={{
                img: {
                  objectFit: "contain",
                },
              }}
              size={{ base: "md", md: "xl" }}
            />
          )}
        </Box>
      </Flex>
      <Text>{user.bio ? user.bio : "My Bio here..."}</Text>
      {currentUser?._id === user?._id && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link to="/update">
            <Button>Update Profile</Button>
          </Link>
          <DeleteAccountButton username={user.username} />
        </div>
      )}
      {currentUser?._id !== user?._id && user && (
        <Button
          colorScheme={following ? "red" : "blue"}
          onClick={handlefollowUnfollow}
          isLoading={updating}
          isDisabled={!currentUser} // 🔹 Disable if logged out
        >
          {following ? "Unfollow" : "Follow"}
        </Button>
      )}

      <Flex w={"full"} justifyContent={"space-between"}>
        <Flex alignItems={"center"} gap={2}>
          <Text color={"gray.light"}>
            {user?.followers?.length || "0"} followers
          </Text>
          <Box w={1} h={1} bg={"gray.light"} borderRadius={"full"}></Box>
          <Text color={"gray.light"}>
            {user?.following?.length || "0"} following
          </Text>
        </Flex>
        <Flex>
          <Box className="icon-container">
            <Instagram size={24} cursor={"pointer"} />
          </Box>
          <Menu>
            <MenuButton>
              <MoreHorizontal size={24} cursor={"pointer"} />
            </MenuButton>
            <Portal>
              <MenuList bg={"gray.dark"}>
                <MenuItem bg={"gray.dark"} onClick={copyURL}>
                  Copy Link
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        </Flex>
      </Flex>
      <Flex w={"full"}>
        <Flex
          flex={1}
          borderBottom={"1.5px solid white"}
          justifyContent={"center"}
          pb="3"
          cursor={"pointer"}
        >
          <Text fontWeight={"bold"}> Threads</Text>
        </Flex>
        <Flex
          flex={1}
          borderBottom={"1px solid gray"}
          justifyContent={"center"}
          color={"gray.light"}
          pb="3"
          cursor={"pointer"}
        >
          <Text fontWeight={"bold"}> Replies</Text>
        </Flex>
      </Flex>
    </VStack>
  );
};

export default UserHeader;
