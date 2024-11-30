import { roles } from "@constants/common.constants.js";

export interface ResponseUser {
  userId: string;
  username: string;
  isAdmin?: boolean;
  role: {
    [key: string]: roles;
  };
}
