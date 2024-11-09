import {Hono} from "hono";

export const registerApiHealthz = (app: Hono) => {
  app.get("/healthz", (c) =>{
    return c.json({
      message: "ok",
      status: "success",
    })
  });
}
