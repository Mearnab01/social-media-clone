import { Avatar, Box, Flex, Image, Skeleton, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { selectedConversationAtom } from "../atoms/chatAtoms";
import { CheckCheck, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
const Message = ({ ownMessage, message, sendAt }) => {
  //send from msg container
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const user = useRecoilValue(userAtom);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  return (
    <>
      {ownMessage ? (
        <>
          <Flex flexDir="column" alignSelf="flex-end">
            {/* me send text msg */}
            {message.text && (
              <Flex gap={2} alignItems="center" flexDir={"row"}>
                <Flex
                  maxW="400px"
                  bg="green.600"
                  p={2}
                  borderRadius="md"
                  color="white"
                  alignItems="center"
                >
                  <Text>{message.text}</Text>
                  <Box
                    ml={2}
                    transition="color 0.3s ease-in-out"
                    color={message.seen ? "blue.400" : "gray.300"}
                    fontWeight={"bold"}
                  >
                    <CheckCheck size={16} />
                  </Box>
                </Flex>
                <Avatar src={user.profilePic} w={7} h={7} />
              </Flex>
            )}
            {/* me send img onload */}
            {message.img && !imgLoaded && (
              <Flex mt={5} w={"250px"}>
                <Image
                  src={message.img}
                  hidden
                  onLoad={() => setImgLoaded(true)}
                  alt="Message image"
                  borderRadius={4}
                />
                <Skeleton w={"200px"} h={"200px"} />
              </Flex>
            )}

            {/* me send img */}
            {message.img && imgLoaded && (
              <Flex mt={5} width={"350px"} gap={2} flexDirection={"row"}>
                <Trash2
                  size={20}
                  color="red"
                  cursor="pointer"
                  style={{
                    opacity: isDeleting ? 0.5 : 1,
                    pointerEvents: isDeleting ? "none" : "auto",
                  }}
                />
                <Box alignItems="center" justifyContent="space-between">
                  {" "}
                  <Image
                    src={message.img}
                    alt="messgae img"
                    borderRadius={4}
                    width="350px"
                  />
                </Box>
                <Avatar src={user.profilePic} w={7} h={7} />
              </Flex>
            )}
          </Flex>
          <Text fontSize="xs" color="gray.400" textAlign="right" mt={1}>
            {sendAt ? sendAt : "just now"}
          </Text>
        </>
      ) : (
        <>
          <Flex flexDir="column">
            <Flex gap={2} alignItems="center">
              <Avatar src={selectedConversation.userProfilePic} w={7} h={7} />
              {/* msg send to me */}
              {message.text && (
                <Text
                  maxW="350px"
                  bg="#9e6cfaef"
                  p={2}
                  borderRadius="md"
                  color="white"
                >
                  {message.text}
                </Text>
              )}
              {/* img send to me onload */}
              {message.img && !imgLoaded && (
                <Flex mt={5} w={"200px"}>
                  <Image
                    src={message.img}
                    hidden
                    onLoad={() => setImgLoaded(true)}
                    alt="Message image"
                    borderRadius={4}
                  />
                  <Skeleton w={"200px"} h={"200px"} />
                </Flex>
              )}
              {/* img send to me */}
              {message.img && imgLoaded && (
                <Flex mt={5} width={"350px"}>
                  <Image src={message.img} alt="messgae img" borderRadius={4} />
                </Flex>
              )}
            </Flex>
          </Flex>
          <Text
            fontSize="xs"
            color="gray.400"
            textAlign="left"
            mt={1}
            ml="40px"
          >
            {sendAt ? sendAt : "just now"}
          </Text>
        </>
      )}
    </>
  );
};

export default Message;
