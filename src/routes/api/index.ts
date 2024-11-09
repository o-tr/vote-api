import {Hono} from "hono";
import {registerApiHealthz} from "@/routes/api/healthz";
import {registerApiV1} from "@/routes/api/v1";

export const registerApi = (app: Hono) => {
  registerApiHealthz(app);
  const api = new Hono();
  registerApiV1(api);
  app.route("/api", api);
}
