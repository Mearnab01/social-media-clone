import React, { useEffect, useState } from "react";
import SuggestedUser from "./SuggestedUser";
import { Box, Flex, Skeleton, SkeletonCircle, Text } from "@chakra-ui/react";
import toast from "react-hot-toast";

const SuggestedUsers = () => {
  const [loading, setLoading] = useState(true);
  const [suggestedUser, setSuggestedUser] = useState([]);
  useEffect(() => {
    setLoading(false);
    const getSuggestedUsers = async () => {
      try {
        const res = await fetch("/api/v1/users/suggested-user");
        const data = await res.json();
        if (data.error) {
          console.log(error.message);
          toast.error(error.message);
        }
        //console.log(data);
        setSuggestedUser(data);
      } catch (error) {
        console.log(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    getSuggestedUsers();
  }, []);
  return (
    <>
      <Text mb={4} fontWeight={"bold"}>
        Suggested Users
      </Text>
      <Flex direction={"column"} gap={4}>
        {!loading &&
          suggestedUser?.map((sUser) => (
            <SuggestedUser key={sUser._id} sUser={sUser} />
          ))}
        {loading &&
          [0, 1, 2, 3, 4].map((_, idx) => (
            <Flex
              key={idx}
              gap={2}
              alignItems={"center"}
              p={"1"}
              borderRadius={"md"}
            >
              {/* avatar skeleton */}
              <Box>
                <SkeletonCircle size={"10"} />
              </Box>
              {/* username and fullname skeleton */}
              <Flex w={"full"} flexDirection={"column"} gap={2}>
                <Skeleton h={"8px"} w={"80px"} />
                <Skeleton h={"8px"} w={"90px"} />
              </Flex>
              {/* follow button skeleton */}
              <Flex>
                <Skeleton h={"20px"} w={"60px"} />
              </Flex>
            </Flex>
          ))}
      </Flex>
    </>
  );
};

export default SuggestedUsers;
