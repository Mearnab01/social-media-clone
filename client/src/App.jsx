import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Box, Container } from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import userAtom from "./atoms/userAtom";
//pages
import HomePage from "./pages/HomePage";
import PostPage from "./pages/PostPage";
import UserPage from "./pages/UserPage";
import AuthPage from "./pages/AuthPage";
import UpdateProfilePage from "./pages/UpdateProfilePage";
//components
import Header from "./components/Header";
import CreatePost from "./components/CreatePost";
import ChatPage from "./pages/ChatPage";
import NotificationPage from "./pages/NotificationPage";
import FollwersPage from "./pages/FollwersPage";
const App = () => {
  const user = useRecoilValue(userAtom);
  const { pathname } = useLocation();
  return (
    <Box position={"relative"} w={"full"}>
      <Container maxW={pathname === "/" ? "1000px" : "800px"}>
        <Header />
        <Routes>
          <Route
            path="/"
            element={user ? <HomePage /> : <Navigate to="/auth" />}
          />
          <Route
            path="/auth"
            element={!user ? <AuthPage /> : <Navigate to="/" />}
          />
          <Route
            path="/update"
            element={user ? <UpdateProfilePage /> : <Navigate to="/auth" />}
          />
          <Route
            path="/followers/:username"
            element={user ? <FollwersPage /> : <Navigate to="/" />}
          />
          <Route
            path="/:username"
            element={
              user ? (
                <>
                  <UserPage /> <CreatePost />
                </>
              ) : (
                <UserPage />
              )
            }
          />
          <Route path="/:username/post/:pid" element={<PostPage />} />
          <Route
            path="/chat"
            element={user ? <ChatPage /> : <Navigate to="/auth" />}
          />
          <Route
            path="/notification"
            element={user ? <NotificationPage /> : <Navigate to="/auth" />}
          />
        </Routes>
      </Container>
    </Box>
  );
};

export default App;
