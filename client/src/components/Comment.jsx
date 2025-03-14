import { Avatar, Divider, Flex, HStack, Text } from "@chakra-ui/react";
import { Trash2Icon } from "lucide-react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
const Comment = ({ reply, onDelete, lastReply }) => {
  //comes from postpage
  const currentUser = useRecoilValue(userAtom);
  const navigate = useNavigate();
  const formattedTime = reply.createdAt
    ? `Commented ${formatDistanceToNow(new Date(reply.createdAt), {
        addSuffix: true,
      })} ago`
    : "Just now";
  //console.log(formattedTime);
  console.log(reply);

  return (
    <>
      <Flex gap={4} py={2} my={2} w={"full"} minH={"5rem"}>
        <Avatar
          src={
            reply.userId === currentUser?._id
              ? currentUser?.profilePic
              : reply.userProfilePic
          }
          size={"sm"}
        />

        <Flex gap={1} w={"full"} flexDirection={"column"}>
          <Flex
            w={"full"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <HStack justifyContent={"space-between"} w={"full"}>
              <Text
                fontSize="sm"
                fontWeight="bold"
                onClick={() => navigate(`/${reply.username}`)}
                cursor={"pointer"}
              >
                {reply.username}
              </Text>
              <Text fontSize="xs" fontWeight="semibold" color={"gray.light"}>
                {formattedTime}
              </Text>

              {currentUser?._id === reply?.userId && (
                <Trash2Icon
                  size={20}
                  color="red"
                  cursor={"pointer"}
                  onClick={() => onDelete(reply._id)}
                />
              )}
            </HStack>
          </Flex>
          <Text>{reply.text}</Text>
        </Flex>
      </Flex>
      {!lastReply ? <Divider /> : null}
    </>
  );
};

export default Comment;
