const salt = process.env.PASSWORD_SALT;
if (!salt) {
  throw new Error("PASSWORD_SALT is not set");
}
export const PASSWORD_SALT = salt;
