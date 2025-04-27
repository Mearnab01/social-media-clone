import { atom } from "recoil";

export const conversationsAtom = atom({
  key: "conversationsAtom",
  default: [],
});

export const selectedConversationAtom = atom({
  key: "selectedConversationAtom", // Make sure the key is unique
  default: {
    _id: "",
    userId: "",
    username: "",
    userProfilePic: "",
    messages: [],
  },
});
