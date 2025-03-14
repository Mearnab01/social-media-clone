import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Avatar, Box, Flex, Image, Text } from "@chakra-ui/react";
import { Trash2 } from "lucide-react";
import Actions from "./Actions";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import postAtom from "../atoms/postAtom";
const Posts = ({ post, postedBy }) => {
  // come from userpage and home page
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useRecoilState(postAtom);
  const currentUser = useRecoilValue(userAtom);
  const navigate = useNavigate();
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(`/api/v1/users/user-profile/${postedBy}`);
        const data = await res.json();
        //console.log(data);
        if (data.error) {
          toast.error(data.error);
        }
        setUser(data);
      } catch (error) {
        console.log(error);
        setUser(null);
      }
    };
    getUser();
  }, [postedBy]);

  const handleDeletePost = async (e) => {
    try {
      e.preventDefault();
      if (!window.confirm("Are you sure you want to delete this post?")) return;
      const res = await fetch(`/api/v1/posts/delete-post/${post._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      }
      //console.log(data);
      toast.success(data.message);
      setPosts(posts.filter((p) => p._id !== post._id));
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };
  if (!user) return null;
  return (
    <Link to={`/${user.username}/post/${post._id}`}>
      <Flex gap={3} mb={4} py={5}>
        <Flex flexDirection={"column"} alignItems={"center"}>
          <Avatar
            size="md"
            sx={{
              img: {
                objectFit: "contain",
              },
            }}
            name={user?.name}
            src={user?.profilePic}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/${user.username}`);
            }}
          />
          <Box w="1px" h={"full"} bg="gray.light" my={2}></Box>
          <Box position={"relative"} w={"full"} minH="25px">
            {post.replies.length === 0 && <Text textAlign={"center"}>🥱</Text>}
            {post.replies.slice(0, 3).map((reply, index) => (
              <Avatar
                key={index}
                size="xs"
                name={reply?.username || "User"}
                src={reply?.userProfilePic || ""}
                position="absolute"
                top="0px"
                left={`${index * 15}px`} // Shift avatars for visibility
                padding="2px"
                gap={2}
              />
            ))}
          </Box>
        </Flex>
        <Flex flex={1} flexDirection={"column"} gap={2}>
          <Flex justifyContent={"space-between"} w={"full"}>
            <Flex w={"full"} alignItems={"center"}>
              <Text
                fontSize={"sm"}
                fontWeight={"bold"}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/${user.username}`);
                }}
              >
                {user?.username}
              </Text>
              <Image src="/verified.png" w={4} h={4} ml={1} />
            </Flex>
            <Flex gap={4} alignItems={"center"}>
              <Text
                fontSize={"xs"}
                textAlign={"right"}
                w={36}
                color={"gray.light"}
              >
                {formatDistanceToNow(new Date(post.createdAt))} ago
              </Text>
              {currentUser?._id === user._id && (
                <Trash2 size={20} color="red" onClick={handleDeletePost} />
              )}
            </Flex>
          </Flex>

          <Text fontSize={"sm"}>{post.text}</Text>
          {post.img && (
            <Box
              borderRadius={6}
              overflow="hidden"
              border="1px solid"
              borderColor="gray.light"
              maxW="400px" // Set a max width
              //maxH="500px" // Set a max height
              mx="auto" // Center it
            >
              <Image
                src={post.img}
                objectFit="contain" // Ensure the whole image fits within
              />
            </Box>
          )}

          <Flex gap={3} my={1}>
            <Actions post={post} />
          </Flex>
        </Flex>
      </Flex>
    </Link>
  );
};

export default Posts;
