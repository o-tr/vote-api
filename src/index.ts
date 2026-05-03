import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import {registerApi} from "@/routes/api";
import "dotenv/config";
import {serveStatic} from "@hono/node-server/serve-static";

const app = new Hono()

app.use('/*',serveStatic({root:"./public/",index:"index.html"}))

registerApi(app);

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
