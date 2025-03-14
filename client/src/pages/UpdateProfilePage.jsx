"use client";

import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
  HStack,
  Avatar,
  Center,
  Box,
  Textarea,
} from "@chakra-ui/react";
import { useRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { useRef, useState } from "react";
import usePreviewImg from "../hooks/usePreviewImg";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const UpdateProfilePage = () => {
  const [user, setUser] = useRecoilState(userAtom);

  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
    bio: user.bio,
    password: "",
  });
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const { handleImageChange, imageUrl } = usePreviewImg();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/users/update-user/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...inputs, profilePic: imageUrl }),
      });
      const data = await res.json();
      console.log(data);
      if (data.error) {
        toast.error(data.error);
      }
      toast.success("User Updataed Successfully");
      setUser(data);
      localStorage.setItem("user-threads", JSON.stringify(data));
      setTimeout(() => {
        navigate(`/${data.username}`); // Navigate to the new username
      }, 100);
      navigate(`/`);
    } catch (error) {
      toast.error(error.message);
      console.log("Error from upfate profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      {" "}
      <Flex align={"center"} justify={"center"} my={6}>
        <Stack
          spacing={4}
          w={"full"}
          maxW={"md"}
          bg={useColorModeValue("white", "gray.dark")}
          rounded={"xl"}
          boxShadow={"lg"}
          p={6}
          my={12}
        >
          <Heading lineHeight={1.1} fontSize={{ base: "2xl", sm: "3xl" }}>
            User Profile Edit
          </Heading>
          <FormControl id="userName">
            <Stack direction={["column", "row"]} spacing={6}>
              <Center>
                <Avatar
                  size="xl"
                  src={imageUrl || user.profilePic}
                  sx={{
                    img: { objectFit: "contain" },
                  }}
                />
              </Center>
              <Center w="full">
                <Button w="full" onClick={() => fileRef.current.click()}>
                  Change Avatar
                </Button>
                <Input
                  type="file"
                  hidden
                  ref={fileRef}
                  onChange={handleImageChange}
                />
              </Center>
            </Stack>
          </FormControl>
          <HStack>
            <Box>
              {" "}
              <FormControl>
                <FormLabel>Full name</FormLabel>
                <Input
                  type="text"
                  onChange={(e) =>
                    setInputs({ ...inputs, name: e.target.value })
                  }
                  value={inputs.name}
                  placeholder="FullName"
                  _placeholder={{ color: "gray.500" }}
                />
              </FormControl>
            </Box>
            <Box>
              {" "}
              <FormControl>
                <FormLabel>User name</FormLabel>
                <Input
                  type="text"
                  onChange={(e) =>
                    setInputs({ ...inputs, username: e.target.value })
                  }
                  value={inputs.username}
                  placeholder="UserName"
                  _placeholder={{ color: "gray.500" }}
                />
              </FormControl>
            </Box>
          </HStack>
          <FormControl>
            <FormLabel>Email address</FormLabel>
            <Input
              type="email"
              onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
              value={inputs.email}
              placeholder="your-email@example.com"
              _placeholder={{ color: "gray.500" }}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Bio</FormLabel>
            <Textarea
              type="text"
              onChange={(e) => setInputs({ ...inputs, bio: e.target.value })}
              value={inputs.bio}
              placeholder="your bio..."
              _placeholder={{ color: "gray.500" }}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              onChange={(e) =>
                setInputs({ ...inputs, password: e.target.value })
              }
              value={inputs.password}
              placeholder="password"
              _placeholder={{ color: "gray.500" }}
            />
          </FormControl>

          <Stack spacing={6} direction={["column", "row"]}>
            <Button
              bg={"red.400"}
              color={"white"}
              w="full"
              _hover={{
                bg: "red.500",
              }}
            >
              Cancel
            </Button>
            <Button
              bg={"green.300"}
              color={"white"}
              w="full"
              _hover={{
                bg: "green.500",
              }}
              type="submit"
              isLoading={loading}
            >
              Submit
            </Button>
          </Stack>
        </Stack>
      </Flex>
    </form>
  );
};

export default UpdateProfilePage;
