import React from "react";
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
} from "@chakra-ui/react";
import useGetUserProfile from "../hooks/useGetUserProfile";

const FollowersPage = () => {
  const { username } = useParams();
  const { user, loading } = useGetUserProfile();
  console.log(user);

  // Use color mode value for light and dark mode
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
          <Tab>Followers ({user?.followers?.length || 0})</Tab>
          <Tab>Following ({user?.following?.length || 0})</Tab>
        </TabList>

        <TabPanels>
          {/* Followers Tab */}
          <TabPanel>
            {user?.followers?.length > 0 ? (
              <Grid
                templateColumns={{
                  base: "1fr",
                  md: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                }}
                gap={4}
              >
                {user.followers.map((follower) => (
                  <VStack
                    key={follower._id}
                    bg={bgColor}
                    borderRadius="lg"
                    boxShadow="md"
                    p={4}
                    spacing={3}
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
                        {follower.name}
                      </Text>
                    </Link>
                    <Text color="gray.500">@{follower.username}</Text>
                  </VStack>
                ))}
              </Grid>
            ) : (
              <Text color="gray.500">No followers yet.</Text>
            )}
          </TabPanel>

          {/* Following Tab */}
          <TabPanel>
            {user?.following?.length > 0 ? (
              <Grid
                templateColumns={{
                  base: "1fr",
                  md: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                }}
                gap={4}
              >
                {user.following.map((f) => (
                  <VStack
                    key={f._id}
                    bg={bgColor}
                    borderRadius="lg"
                    boxShadow="md"
                    p={4}
                    spacing={3}
                  >
                    <Avatar name={f.username} src={f.profilePic} size="lg" />
                    <Link to={`/${f.username}`}>
                      <Text
                        fontWeight="bold"
                        color={textColor}
                        _hover={{ textDecoration: "underline" }}
                      >
                        {f.name}
                      </Text>
                    </Link>
                    <Text color="gray.500">@{f.username}</Text>
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
