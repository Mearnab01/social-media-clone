import { Avatar, Box, Button, Flex, Text } from "@chakra-ui/react";
import React from "react";
import { Link } from "react-router-dom";
import useFollowUnfollow from "../hooks/useFollowUnfollow";

const SuggestedUser = ({ sUser }) => {
  const { handlefollowUnfollow, following, updating } =
    useFollowUnfollow(sUser);
  //console.log(handlefollowUnfollow);

  return (
    <Flex
      gap={3}
      justifyContent="space-between"
      alignItems="center"
      p={2}
      borderRadius="lg"
      transition="transform 0.3s ease-in-out"
    >
      <Flex gap={3} as={Link} to={`/${sUser.username}`} alignItems="center">
        <Avatar
          src={
            sUser.profilePic
              ? sUser.profilePic
              : "https://avatars.githubusercontent.com/u/124599?v=4"
          }
          sx={{
            img: {
              objectFit: "contain",
            },
          }}
          size="md"
        />
        <Box>
          <Text fontSize="sm" fontWeight="bold">
            {sUser.username}
          </Text>
          <Text color="gray.500" fontSize="xs">
            {sUser.bio ? sUser.bio.slice(0, 12) + "..." : "No bio"}
          </Text>
        </Box>
      </Flex>
      <Button
        size="sm"
        color="white"
        bg={following ? "red.400" : "#9a6efe"}
        onClick={handlefollowUnfollow}
        isLoading={updating}
        _hover={{
          opacity: 0.8,
        }}
      >
        {following ? "Unfollow" : "Follow"}
      </Button>
    </Flex>
  );
};

export default SuggestedUser;
