import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Box,
  Grid,
  Heading,
  Text,
  VStack,
  Avatar,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react";
import useGetUserProfile from "../hooks/useGetUserProfile";

const FollowersPage = () => {
  const { username } = useParams();
  const { loading } = useGetUserProfile();

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  // Fetch followers and following data
  const fetchData = async () => {
    try {
      const [followersRes, followingRes] = await Promise.all([
        fetch(`/api/v1/users/${username}/followers`),
        fetch(`/api/v1/users/${username}/following`),
      ]);
      const followersData = await followersRes.json();
      const followingData = await followingRes.json();
      if (followersData.success) {
        setFollowers(followersData.followers || []);
      }
      if (followingData.success) {
        setFollowing(followingData.following || []);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [username]);

  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");

  if (loading) {
    return (
      <VStack minH="80vh" justify="center">
        <Spinner size="xl" />
      </VStack>
    );
  }

  return (
    <Box p={6}>
      <Heading size="lg" mb={6} color={textColor}>
        {username}'s Connections
      </Heading>

      <Tabs variant="soft-rounded" colorScheme="blue">
        <TabList mb={4}>
          <Tab>Followers ({followers?.length || 0})</Tab>
          <Tab>Following ({following?.length || 0})</Tab>
        </TabList>

        <TabPanels>
          {/* Followers Tab */}
          <TabPanel>
            {followers?.length > 0 ? (
              <Grid
                templateColumns={{
                  base: "1fr",
                  md: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                }}
                gap={4}
              >
                {followers.map((follower) => (
                  <VStack
                    key={follower._id}
                    bg={bgColor}
                    borderRadius="lg"
                    boxShadow="md"
                    p={4}
                    spacing={3}
                    align="center"
                  >
                    <Avatar
                      name={follower.username}
                      src={follower.profilePic}
                      size="lg"
                    />
                    <Link to={`/${follower.username}`}>
                      <Text
                        fontWeight="bold"
                        color={textColor}
                        _hover={{ textDecoration: "underline" }}
                      >
                        @{follower.username}
                      </Text>
                    </Link>
                    <Text color="gray.500" fontSize="sm">
                      {follower.postCount} Posts
                    </Text>
                    <Flex justify="space-evenly" w="full" fontSize="sm">
                      <Text color="gray.500">
                        {follower.followerCount} Followers
                      </Text>
                      <Text color="gray.500">
                        {follower.followingCount} Following
                      </Text>
                    </Flex>
                  </VStack>
                ))}
              </Grid>
            ) : (
              <Text color="gray.500">No followers yet.</Text>
            )}
          </TabPanel>

          {/* Following Tab */}
          <TabPanel>
            {following?.length > 0 ? (
              <Grid
                templateColumns={{
                  base: "1fr",
                  md: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                }}
                gap={4}
              >
                {following.map((f) => (
                  <VStack
                    key={f._id}
                    bg={bgColor}
                    borderRadius="lg"
                    boxShadow="md"
                    p={4}
                    spacing={3}
                    align="center"
                  >
                    <Avatar name={f.username} src={f.profilePic} size="lg" />
                    <Link to={`/${f.username}`}>
                      <Text
                        fontWeight="bold"
                        color={textColor}
                        _hover={{ textDecoration: "underline" }}
                      >
                        @{f.username}
                      </Text>
                    </Link>
                    <Text color="gray.500" fontSize="sm">
                      {f.postCount} Posts
                    </Text>
                    <Flex justify="space-evenly" w="full" fontSize="sm">
                      <Text color="gray.500">{f.followerCount} Followers</Text>
                      <Text color="gray.500">{f.followingCount} Following</Text>
                    </Flex>
                  </VStack>
                ))}
              </Grid>
            ) : (
              <Text color="gray.500">Not following anyone yet.</Text>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default FollowersPage;
