import React from "react";
import {
  Box,
  Text,
  Button,
  VStack,
  Avatar,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react";
import { Eye, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRecoilState } from "recoil";
import useGetAllNotifications from "../hooks/useGetAllNotifications";
import notificationAtom from "../atoms/notificationAtom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const NotificationPage = () => {
  useGetAllNotifications();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useRecoilState(notificationAtom);
  const bgColor = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.200");
  const cardBgColor = useColorModeValue("white", "gray.800");

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`/api/v1/notifications/read`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.error) {
        console.log(data.error);
      } else {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        toast.success(data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const deleteNotification = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this notification?"
    );
    if (!confirmDelete) return;
    try {
      const res = await fetch(`/api/v1/notifications/delete`, {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      const data = res.json();
      if (data.error) {
        console.log(data.error);
      } else {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        toast.success("Notification deleted ");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <Box p={6} bg={bgColor} minH="90vh">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Flex align="center" mb={8}>
          <Box p={3} bg="blue.100" borderRadius="full">
            <Text fontSize="xl" color="blue.600">
              🔔
            </Text>
          </Box>
          <Box ml={4}>
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>
              Your Notifications
            </Text>
            <Text fontSize="sm" color="gray.500">
              Stay updated with your progress
            </Text>
          </Box>
        </Flex>

        {/* Notification List */}
        <Box
          maxHeight="70vh"
          overflowY="auto"
          sx={{
            scrollbarWidth: "thin",
            scrollbarColor: "gray.400 gray.200",
          }}
        >
          {notifications.length === 0 ? (
            <Text textAlign="center" color="gray.500">
              No notifications found. You're all caught up 🎉
            </Text>
          ) : (
            <VStack spacing={4}>
              {Array.isArray(notifications) &&
                notifications.map((n) => (
                  <Box
                    key={n._id}
                    bg={cardBgColor}
                    borderRadius="md"
                    boxShadow="md"
                    p={4}
                    display="flex"
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                    minHeight="90px"
                    width="100%"
                    cursor="pointer"
                    _hover={{
                      boxShadow: "lg",
                      transition: "transform 0.2s ease-in-out",
                    }}
                    opacity={n.isRead ? 0.5 : 1}
                  >
                    <Flex align="center" gap={4}>
                      <Avatar
                        size="lg"
                        objectFit={"contain"}
                        src={n.fromUser?.profilePic}
                        onClick={() => {
                          navigate(`/${n.fromUser?.username}`);
                        }}
                        cursor="pointer"
                      />
                      <Box>
                        <Text fontWeight="bold" color={textColor}>
                          {n.fromUser?.username}
                        </Text>
                        <Text
                          color="gray.500"
                          fontSize="sm"
                          onClick={() => {
                            if (n.postId) {
                              navigate(
                                `/${n.fromUser?.username}/post/${n.postId}`
                              );
                            } else {
                              navigate(`/${n.fromUser?.username}`);
                            }
                          }}
                          cursor="pointer"
                        >
                          {n.message.length > 50
                            ? n.message.slice(0, 50) + "..."
                            : n.message}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          {formatDistanceToNow(new Date(n.createdAt), {
                            addSuffix: true,
                          })}
                        </Text>
                      </Box>
                    </Flex>

                    <Flex gap={2}>
                      {!n.isRead && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsRead(n._id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteNotification(n._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </Flex>
                  </Box>
                ))}
            </VStack>
          )}
        </Box>
      </div>
    </Box>
  );
};

export default NotificationPage;
