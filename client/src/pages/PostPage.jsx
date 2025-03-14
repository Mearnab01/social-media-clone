import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Image,
  Text,
} from "@chakra-ui/react";
import Actions from "../components/Actions";
import Comment from "../components/Comment";
import { Trash2 } from "lucide-react";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { SpinnerIcon } from "@chakra-ui/icons";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import toast from "react-hot-toast";
import postAtom from "../atoms/postAtom";

const PostPage = () => {
  const { user, loading } = useGetUserProfile();
  const navigate = useNavigate();
  const [posts, setPosts] = useRecoilState(postAtom);
  const { pid } = useParams();
  const currentUser = useRecoilValue(userAtom);

  const currentPost = posts.find((post) => post?._id === pid);
  //console.log(currentPost);
  useEffect(() => {
    const getPost = async () => {
      try {
        const res = await fetch(`/api/v1/posts/${pid}`);
        const data = await res.json();
        if (data.error) {
          toast.error(data.error);
          return;
        }
        setPosts([data]); // Ensure post state updates correctly
      } catch (error) {
        console.log(error.message);
        toast.error(error.message);
      }
    };

    if (!currentPost) {
      getPost();
    }
  }, [pid, setPosts, currentPost]);

  const handleDeletePost = async () => {
    try {
      if (!window.confirm("Are you sure you want to delete this post?")) return;
      const res = await fetch(`/api/v1/posts/delete-post/${currentPost?._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }
      toast.success(data.message);
      setPosts((prevPosts) => prevPosts.filter((post) => post?._id !== pid));
      navigate(`/${user.username}`);
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await fetch(`/api/v1/posts/delete-comment/${commentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success("Comment deleted successfully");

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post?._id === pid
            ? {
                ...post,
                replies: post.replies.filter(
                  (reply) => reply?._id !== commentId
                ),
              }
            : post
        )
      );
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete comment");
    }
  };

  if (loading) {
    return (
      <Flex justifyContent={"center"}>
        <SpinnerIcon size={"xl"} />
      </Flex>
    );
  }

  if (!currentPost) return null;

  return (
    <>
      <Flex>
        <Flex w="full" alignItems="center" gap={3} mt="50px">
          <Link to={`/${user.username}`} cursor="pointer">
            <Flex alignItems="center" gap={3}>
              <Avatar src={user.profilePic} size="md" name={user.username} />
              <Flex alignItems="center" gap={1}>
                <Text fontSize="sm" fontWeight="bold">
                  {user.username}
                </Text>
                <Image src="/verified.png" w={4} h={4} />
              </Flex>
            </Flex>
          </Link>
        </Flex>

        <Flex gap={4} alignItems={"center"}>
          <Text
            fontSize={"xs"}
            width={36}
            textAlign={"right"}
            color={"gray.light"}
          >
            {formatDistanceToNow(new Date(currentPost.createdAt))} ago
          </Text>

          {currentUser?._id === user?._id && (
            <Trash2
              size={20}
              cursor={"pointer"}
              color={"red"}
              onClick={handleDeletePost}
            />
          )}
        </Flex>
      </Flex>

      <Text my={3}>{currentPost.text}</Text>

      <Box
        borderRadius={6}
        overflow={"hidden"}
        border={"1px solid"}
        borderColor={"gray.light"}
      >
        {currentPost.img && <Image src={currentPost.img} w={"full"} />}
      </Box>

      <Flex gap={3} my={3}>
        <Actions
          key={currentPost?._id}
          post={currentPost}
          postedBy={currentPost.postedBy}
        />
      </Flex>

      <Divider my={4} />

      <Flex justifyContent={"space-between"}>
        <Flex gap={2} alignItems={"center"}>
          <Text fontSize={"2xl"}>👋</Text>
          <Text color={"gray.light"}>Get the app to like, reply and post.</Text>
        </Flex>
        <Button>Get</Button>
      </Flex>

      <Divider my={4} />

      {currentPost.replies.length > 0 &&
        currentPost.replies.map((reply) => (
          <Comment
            key={reply?._id}
            reply={reply}
            onDelete={handleDeleteComment}
            lastreply={
              reply?._id ===
              currentPost.replies[currentPost.replies.length - 1]?._id
            }
          />
        ))}
    </>
  );
};

export default PostPage;
