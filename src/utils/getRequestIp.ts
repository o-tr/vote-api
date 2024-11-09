import {Context} from "hono";

export const getRequestIp = (c: Context) => {
  return c.req.header("x-forwarded-for") ?? c.req.queries("ip")?.[0] ?? "127.0.0.1";
}
