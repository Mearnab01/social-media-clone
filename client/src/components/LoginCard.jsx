"use client";

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
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import authScreenAtom from "../atoms/authAtom";
import userAtom from "../atoms/userAtom";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const LoginCard = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const setUser = useSetRecoilState(userAtom);
  const [inputs, setInputs] = useState({
    username: "",
    password: "",
  });
  const handleLogin = async () => {
    try {
      const res = await fetch("/api/v1/users/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(inputs),
      });
      const data = await res.json();
      //console.log(data, "from login card");
      if (data.error) {
        toast.error("Error: " + data.error);
      } else {
        localStorage.setItem("user-threads", JSON.stringify(data));
        toast.success(data.message);
        setUser(data);
      }
    } catch (error) {
      console.log("error from LoginCard", error);
      toast.error("Login failed. Please try again.");
    }
  };
  return (
    <Stack minH={"100vh"} direction={{ base: "column", md: "row" }}>
      <Flex p={8} flex={1} align={"center"} justify={"center"}>
        <Stack spacing={4} w={"full"} maxW={"md"}>
          <Heading fontSize={"2xl"}>Login in to your account</Heading>
          <FormControl id="username" isRequired>
            <FormLabel>Username</FormLabel>
            <Input
              type="text"
              placeholder="arnab-123"
              onChange={(e) =>
                setInputs({ ...inputs, username: e.target.value })
              }
              value={inputs.username}
            />
          </FormControl>
          <FormControl id="password" isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter the password"
                onChange={(e) => {
                  setInputs({ ...inputs, password: e.target.value });
                }}
                value={inputs.password}
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
              onClick={handleLogin}
            >
              Login
            </Button>
          </Stack>
          <Stack pt={6}>
            <Text align={"center"} color={"blue.400"}>
              Don't have an account?{" "}
              <Link onClick={() => setAuthScreen("signup")}>Sign Up</Link>
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
            "https://img.freepik.com/free-vector/computer-login-concept-illustration_114360-7872.jpg?t=st=1741339993~exp=1741343593~hmac=1144f0f327cdfd41023f12caa26c0a53becfd95073c4c79600d6629a08b2c1ae&w=900"
          }
        />
      </Flex>
    </Stack>
  );
};

export default LoginCard;
