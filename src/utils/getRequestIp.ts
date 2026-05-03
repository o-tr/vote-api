import {Context} from "hono";

export const getRequestIp = (c: Context) => {
  const header = c.req.header("x-forwarded-for");
  if (!header) return "127.0.0.1";
  return header.split(",")[0].trim();
}
