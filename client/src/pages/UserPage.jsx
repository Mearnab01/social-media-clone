import React, { useEffect, useState } from "react";
import UserHeader from "../components/UserHeader";
import { useParams } from "react-router-dom";
import { Flex, Spinner, Text, Icon } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import Posts from "../components/Posts";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { useRecoilState } from "recoil";
import postAtom from "../atoms/postAtom";

const UserPage = () => {
  const { user, loading } = useGetUserProfile();
  const { username } = useParams();
  const [posts, setPosts] = useRecoilState(postAtom);
  const [fetchingPosts, setFetchingPosts] = useState(true);

  useEffect(() => {
    if (!user || loading) return; // ✅ Ensure user is fully loaded before fetching posts

    const getPosts = async () => {
      setPosts([]);
      setFetchingPosts(true);
      try {
        const res = await fetch(`/api/v1/posts/get-post/${username}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch posts");
        }

        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts([]); // Prevent undefined errors
      } finally {
        setFetchingPosts(false);
      }
    };

    getPosts();
  }, [username, user, setPosts]); // ✅ Include `user` in dependencies

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  if (!user) {
    return (
      <Flex
        direction="row"
        gap="10px"
        align="center"
        justify="center"
        minH="100vh"
      >
        <Icon as={CloseIcon} boxSize={8} color="red.500" mb={4} />
        <Text fontSize="xl" color="red.500" fontWeight="bold">
          User Not Found
        </Text>
      </Flex>
    );
  }

  return (
    <>
      <UserHeader user={user} />

      {!fetchingPosts && posts.length === 0 && (
        <Text textAlign="center" fontSize="lg" color="gray.500">
          🥱 User has no posts
        </Text>
      )}

      {fetchingPosts && (
        <Flex justifyContent="center" my={12}>
          <Spinner size="xl" />
        </Flex>
      )}

      {posts.map((post) => (
        <Posts key={post._id} post={post} postedBy={post.postedBy} />
      ))}
    </>
  );
};

export default UserPage;
