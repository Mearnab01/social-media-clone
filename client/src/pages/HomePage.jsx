import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Posts from "../components/Posts";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import postAtom from "../atoms/postAtom";
import SuggestedUsers from "../components/SuggestedUsers";

const HomePage = () => {
  const currentUser = useRecoilValue(userAtom);
  const [posts, setPosts] = useRecoilState(postAtom);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const getFeedPosts = async () => {
      setLoading(true);
      setPosts([]);
      try {
        const res = await fetch("/api/v1/posts/feed");
        const data = await res.json();

        if (data.error) {
          toast.error(data.error);
          return;
        } else {
          setPosts(data);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts([]); // Prevent undefined errors
      } finally {
        setLoading(false); // Stop loading after fetching
      }
    };

    getFeedPosts();
  }, [currentUser?.following, setPosts]);

  return (
    <Flex
      gap="50px"
      alignItems="flex-start"
      flexDirection={{ base: "column", md: "row" }}
      width={{ md: "100%", base: "350px" }}
      margin="auto" // Stack in mobile, row in desktop
    >
      {/* Suggested Users at the Top in Mobile */}
      <Box flex={30} display={{ base: "block", md: "none" }}>
        <SuggestedUsers />
      </Box>

      {/* Posts Section */}
      <Box flex={70}>
        {loading ? (
          <Flex justify="center" mt={10}>
            <Spinner size="xl" />
          </Flex>
        ) : !currentUser ? (
          <Flex justify="center" mt={10}>
            <Text fontSize="xl" fontWeight="bold" color="gray.500">
              Please log in to see posts
            </Text>
          </Flex>
        ) : posts.length === 0 ? (
          <Flex justify="center" mt={10}>
            <Text fontSize="xl" fontWeight="bold" color="gray.500">
              Follow someone to see posts
            </Text>
          </Flex>
        ) : (
          posts.map((post) => (
            <Posts key={post._id} post={post} postedBy={post.postedBy} />
          ))
        )}
      </Box>

      {/* Suggested Users in Sidebar for Larger Screens */}
      <Box flex={30} display={{ base: "none", md: "block" }}>
        <SuggestedUsers />
      </Box>
    </Flex>
  );
};

export default HomePage;
