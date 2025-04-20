import {
  Avatar,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  Image,
  useColorMode,
  useDisclosure,
  useMediaQuery,
} from "@chakra-ui/react";
import React from "react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { Link } from "react-router-dom";
import {
  Bell,
  HomeIcon,
  LogOutIcon,
  MessageCircle,
  User2Icon,
  Menu,
  UsersIcon,
} from "lucide-react";
import useLogOut from "../hooks/useLogOut";

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const handleLogout = useLogOut();
  const user = useRecoilValue(userAtom);
  //console.log(user, "mobile header");
  const [isMobileNav] = useMediaQuery("(max-width: 700px)"); // Detect mobile screens

  return (
    <>
      {user && isMobileNav ? (
        <MobileNav />
      ) : (
        <>
          <Flex
            justifyContent={{ md: "space-between", base: "space-evenly" }}
            alignItems="center"
            m="12px"
          >
            {user && (
              <>
                <Link to="/">
                  <HomeIcon size={24} />
                </Link>
                <Image
                  cursor="pointer"
                  src={
                    colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"
                  }
                  alt="logo"
                  w={6}
                  onClick={toggleColorMode}
                />
              </>
            )}

            {user && (
              <Flex
                alignItems="center"
                justifyContent="space-between"
                w="250px"
                gap={4}
              >
                <Link to={`/${user.username}`}>
                  <IconButton
                    aria-label="Profile"
                    icon={<User2Icon size={24} />}
                    variant="ghost"
                    _hover={{ bg: "gray.200", color: "black", rounded: "full" }}
                  />
                </Link>
                <Link to="/chat">
                  <IconButton
                    aria-label="Chat"
                    icon={<MessageCircle size={24} />}
                    variant="ghost"
                    _hover={{ bg: "gray.200", color: "black", rounded: "full" }}
                  />
                </Link>
                <Link to="/notification">
                  <IconButton
                    aria-label="Notifications"
                    icon={<Bell size={24} />}
                    variant="ghost"
                    _hover={{ bg: "gray.200", color: "black", rounded: "full" }}
                  />
                </Link>
                <Link to={`/followers/${user.username}`}>
                  <IconButton
                    aria-label="Followers"
                    icon={<UsersIcon size={24} />}
                    variant="ghost"
                    _hover={{ bg: "gray.200", color: "black", rounded: "full" }}
                  />
                </Link>
                <IconButton
                  aria-label="Logout"
                  icon={<LogOutIcon size={24} />}
                  variant="ghost"
                  onClick={handleLogout}
                  _hover={{ bg: "gray.200", color: "black", rounded: "full" }}
                />
              </Flex>
            )}
          </Flex>
          <Divider mb="20px" />
        </>
      )}
    </>
  );
};

export default Header;

const MobileNav = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const handleLogout = useLogOut();
  const user = useRecoilValue(userAtom);
  console.log(user, "mobile nav");

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Flex justifyContent="space-between" alignItems="center" m="12px">
        {user && (
          <>
            <Link to="/">
              <HomeIcon size={24} />
            </Link>
            <Image
              cursor="pointer"
              src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
              alt="logo"
              w={6}
              onClick={toggleColorMode}
            />
            <IconButton
              display={{ base: "flex", md: "none" }}
              aria-label="Open Menu"
              icon={<Menu size={24} />}
              variant="ghost"
              onClick={onOpen}
            />
          </>
        )}
      </Flex>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <Flex justifyContent="center" mb={4}>
              <Avatar
                src={user.profilePic}
                alt={user.username}
                boxSize="100px"
              />
            </Flex>
            <Flex direction="column" gap={4}>
              <Link to={`/${user.username}`} onClick={onClose}>
                <Button
                  leftIcon={<User2Icon size={20} />}
                  variant="ghost"
                  w="full"
                >
                  Profile
                </Button>
              </Link>
              <Link to="/chat" onClick={onClose}>
                <Button
                  leftIcon={<MessageCircle size={20} />}
                  variant="ghost"
                  w="full"
                >
                  Messages
                </Button>
              </Link>
              <Link to="/notification" onClick={onClose}>
                <Button leftIcon={<Bell size={20} />} variant="ghost" w="full">
                  Notifications
                </Button>
              </Link>
              <Button
                leftIcon={<LogOutIcon size={20} />}
                variant="ghost"
                w="full"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};
