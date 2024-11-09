import {Hono} from "hono";
import {registerApiVote} from "@/routes/api/v1/votes";

export const registerApiV1 = (app: Hono) => {
  const api = new Hono();
  registerApiVote(api);
  app.route("/v1", api);
}
