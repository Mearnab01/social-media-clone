import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: "strict",
  });
  return token;
};
export default generateTokenAndSetCookie;
// In the above snippet, we have created a utility function generateTokenAndSetCookie that takes userId and res as arguments. This function generates a token using jwt.sign() method and sets it in a cookie using res.cookie() method. The token is signed with the userId and JWT_SECRET from the environment variables. The cookie is set with the name jwt, httpOnly set to true, maxAge set to 30 days, and sameSite set to strict. Finally, the function returns the generated token.
