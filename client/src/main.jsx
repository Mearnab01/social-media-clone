import { ChakraProvider } from "@chakra-ui/react";
import { createRoot } from "react-dom/client";
import { mode } from "@chakra-ui/theme-tools";
import { extendTheme } from "@chakra-ui/theme-utils";
import { ColorModeScript } from "@chakra-ui/color-mode";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { RecoilRoot } from "recoil";
import { Toaster } from "react-hot-toast";
import { SocketContextProvider } from "./context/SocketContext.jsx";

const styles = {
  global: (props) => ({
    body: {
      color: mode("gray.800", "whiteAlpha.900")(props),
      bg: mode("gray.100", "#101010")(props),
    },
  }),
};

const config = {
  initialColorMode: "dark",
  useSystemColorMode: true,
};

const colors = {
  gray: {
    light: "#616161",
    dark: "#1e1e1e",
  },
};

const theme = extendTheme({ config, styles, colors });
createRoot(document.getElementById("root")).render(
  <RecoilRoot>
    <BrowserRouter>
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <SocketContextProvider>
          <App />
        </SocketContextProvider>
        <Toaster position="top-right" reverseOrder={false} />
      </ChakraProvider>
    </BrowserRouter>
  </RecoilRoot>
);
