import crypto from "crypto";

export const generateInviteCode = (): string => {
  // This uses the built-in Node.js crypto engine
  return crypto.randomBytes(3).toString("hex").toUpperCase();
};
