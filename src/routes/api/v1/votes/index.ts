import {Hono} from "hono";
import {z} from "zod";
import {zValidator} from "@hono/zod-validator";
import {prisma} from "@/lib/prisma";
import {hashPassword} from "@/lib/password";
import {registerVoteRoute} from "@/routes/api/v1/votes/[voteId]";

export const registerApiVote = (app: Hono) => {
  const api = new Hono();
  postIndex(api);
  registerVoteRoute(api);
  app.route("/votes", api);
}

const postSchema = z.object({
  title: z.string(),
  content: z.string().optional(),
  options: z.array(z.string()),
  password: z.string().max(32),
})

const postIndex = (app: Hono) => {
  app.post("/", zValidator("json", postSchema), async(c) => {
    const {title, content, password, options} = c.req.valid("json");
    
    const passwordHash = await hashPassword(password);
    
    const optionStr = JSON.stringify(options);
    
    const vote = await prisma.vote.create({
      data: {
        title,
        content,
        password: passwordHash,
        options: optionStr
      }
    })
    
    return c.json({
      id: vote.id,
      title: vote.title,
      content: vote.content,
      options,
    });
  });
}
