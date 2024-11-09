import bcrypt from "bcrypt";
import {PASSWORD_SALT} from "@/const/env";

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password + PASSWORD_SALT, 10);
}

export const isPasswordValid = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password + PASSWORD_SALT, hash);
}
