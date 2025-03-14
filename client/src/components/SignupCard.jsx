"use client";
import { toast } from "react-hot-toast";
import {
  Button,
  Flex,
  Text,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Image,
  HStack,
  Box,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useRecoilState } from "recoil";
import authScreenAtom from "../atoms/authAtom";
import userAtom from "../atoms/userAtom";

const SignupCard = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [authScreen, setAuthScreen] = useRecoilState(authScreenAtom);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useRecoilState(userAtom);
  const [inputs, setInputs] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const handleSignup = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/users/signup", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(inputs),
      });
      const data = await res.json();
      //console.log(data);
      if (data.error) {
        toast.error("Error: " + data.error);
      } else {
        toast.success(data.message);
      }
      localStorage.setItem("user-threads", JSON.stringify(data));
      setUser(data);
    } catch (error) {
      console.log("error from signupCard", error);
      toast.error("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack minH={"100vh"} direction={{ base: "column", md: "row" }}>
      <Flex p={8} flex={1} align={"center"} justify={"center"}>
        <Stack spacing={4} w={"full"} maxW={"md"}>
          <Heading fontSize={"2xl"}>Sign up for an account</Heading>
          <HStack>
            <Box>
              <FormControl id="firstName" isRequired>
                <FormLabel>First Name</FormLabel>
                <Input
                  type="text"
                  placeholder="AP Nathson"
                  value={inputs.name}
                  onChange={(e) =>
                    setInputs({ ...inputs, name: e.target.value })
                  }
                />
              </FormControl>
            </Box>
            <Box>
              <FormControl id="username" isRequired>
                <FormLabel>Username</FormLabel>
                <Input
                  type="text"
                  placeholder="natharth-123"
                  value={inputs.username}
                  onChange={(e) =>
                    setInputs({ ...inputs, username: e.target.value })
                  }
                />
              </FormControl>
            </Box>
          </HStack>
          <FormControl id="email" isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              placeholder="@gmail.com"
              value={inputs.email}
              onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
            />
          </FormControl>
          <FormControl id="password" isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={inputs.password}
                onChange={(e) =>
                  setInputs({ ...inputs, password: e.target.value })
                }
              />
              <InputRightElement h={"full"}>
                <Button
                  variant={"ghost"}
                  onClick={() =>
                    setShowPassword((showPassword) => !showPassword)
                  }
                >
                  {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <Stack spacing={6} flexDirection={"column"}>
            <Button
              colorScheme={"blue"}
              variant={"solid"}
              onClick={handleSignup}
              isLoading={loading}
              loadingText="Please wait..."
            >
              Sign up
            </Button>
          </Stack>
          <Stack pt={6}>
            <Text align={"center"} color={"blue.400"}>
              Already have an account?{" "}
              <Link onClick={() => setAuthScreen("login")}>Login Now</Link>
            </Text>
          </Stack>
        </Stack>
      </Flex>
      <Flex flex={1}>
        <Image
          marginTop={"32vh"}
          alt={"Login Image"}
          objectFit={"cover"}
          boxSize="300px"
          display={{ base: "none", md: "block" }}
          src={
            "https://img.freepik.com/free-vector/sign-concept-illustration_114360-5425.jpg"
          }
        />
      </Flex>
    </Stack>
  );
};

export default SignupCard;
