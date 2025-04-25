import { atom } from "recoil";

const notificationAtom = atom({
  key: "notificationAtom",
  default: [],
});

export default notificationAtom;
