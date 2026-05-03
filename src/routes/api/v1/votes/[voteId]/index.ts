import {Hono} from "hono";
import {z} from "zod";
import {zValidator} from "@hono/zod-validator";
import {prisma} from "@/lib/prisma";
import {isPasswordValid} from "@/lib/password";
import {extractBasicAuthPassword} from "@/utils/basicAuth";
import {registerApiRegister} from "@/routes/api/v1/votes/[voteId]/register";
import {registerApiSetName} from "@/routes/api/v1/votes/[voteId]/set-name";
import {registerApiV1VotesVoteIdResult} from "@/routes/api/v1/votes/[voteId]/result";
import {getRequestIp} from "@/utils/getRequestIp";

export const registerVoteRoute = (app: Hono) => {
  getIndex(app);
  patchIndex(app);
  deleteIndex(app);
  registerApiRegister(app);
  registerApiSetName(app);
  registerApiV1VotesVoteIdResult(app);
}

const getIndex = (app: Hono) => {
  app.get("/:voteId", async(c) => {
    const voteId = c.req.param("voteId");
    const vote = await prisma.vote.findUnique({
      where: {
        id: voteId,
      }
    });
    
    if (!vote) {
      return c.json({
        error: "Vote not found",
      }, 404);
    }
    
    const ip = getRequestIp(c);
    
    const answer = await prisma.answer.findUnique({
      where: {
        ip_voteId: {
          ip,
          voteId,
        }
      }
    });
    
    let options: string[];
    try {
      options = JSON.parse(vote.options);
    } catch {
      return c.json({
        error: "Invalid vote options",
      }, 500);
    }
    
    return c.json({
      id: vote.id,
      title: vote.title,
      content: vote.content,
      options,
      answer: answer ? {
        value: answer.value,
        name: answer.name,
      } : null,
    });
  });
}

const patchSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
});

const patchIndex = (app: Hono) => {
  app.patch("/:voteId", zValidator("json", patchSchema), async(c) => {
    const {title, content} = c.req.valid("json");
    const basicAuth = c.req.header("Authorization");
    if (!basicAuth){
      return c.json({
        error: "Unauthorized"
      }, 401)
    }
    const password = extractBasicAuthPassword(basicAuth);
    
    const vote = await prisma.vote.findUnique({
      where: {
        id: c.req.param("voteId"),
      }
    })
    
    if (!vote) {
      return c.json({
        error: "Vote not found",
      }, 404);
    }
    
    if (!password || !await isPasswordValid(password, vote.password)) {
      return c.json({
        error: "Invalid password",
      }, 401);
    }
    
    const updatedVote = await prisma.vote.update({
      where: {
        id: c.req.param("voteId"),
      },
      data: {
        title,
        content,
      }
    });
    
    return c.json({
      id: updatedVote.id,
      title: updatedVote.title,
      content: updatedVote.content,
    });
  });
}

const deleteIndex = (app: Hono) => {
  app.delete("/:voteId", async(c) => {
    const basicAuth = c.req.header("Authorization");
    const password = extractBasicAuthPassword(basicAuth);
    if (!password){
      return c.json({
        error: "Unauthorized"
      }, 401)
    }
    
    const vote = await prisma.vote.findUnique({
      where: {
        id: c.req.param("voteId"),
      }
    });
    
    if (!vote) {
      return c.json({
        error: "Vote not found",
      }, 404);
    }
    
    if (!await isPasswordValid(password, vote.password)) {
      return c.json({
        error: "Invalid password",
      }, 401);
    }
    
    await prisma.vote.delete({
      where: {
        id: c.req.param("voteId"),
      }
    });
    
    return c.json({
      message: "Vote deleted",
    });
  });
}
