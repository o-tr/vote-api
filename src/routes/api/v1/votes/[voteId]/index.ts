import {Hono} from "hono";
import {z} from "zod";
import {zValidator} from "@hono/zod-validator";
import {prisma} from "@/lib/prisma";
import {isPasswordValid} from "@/lib/password";
import {registerApiRegister} from "@/routes/api/v1/votes/[voteId]/register";
import {registerApiSetName} from "@/routes/api/v1/votes/[voteId]/set-name";

export const registerVoteRoute = (app: Hono) => {
  getIndex(app);
  patchIndex(app);
  deleteIndex(app);
  registerApiRegister(app);
  registerApiSetName(app);
}

const getIndex = (app: Hono) => {
  app.get("/:voteId", async(c)=>{
    const basicAuth = c.req.header("Authorization");
    if (!basicAuth){
      return c.json({
        error: "Unauthorized"
      }, 401)
    }
    const password = Buffer.from(basicAuth.split(" ")[1], "base64").toString("utf-8").split(":")[1];
    const voteId = c.req.param("voteId");

    const vote = await prisma.vote.findFirst({
      where:{
        id: voteId,
      },
      include:{
        answers: true,
      }
    })
    
    if (!vote){
      return c.json({
        error: "Vote not found",
      }, 404)
    }
    
    if (!password || !await isPasswordValid(password, vote.password)){
      return c.json({
        error: "Unauthorized"
      }, 401)
    }
    
    return c.json({
      title: vote.title,
      content: vote.content,
      answers: vote.answers.map((v)=>({
        name: v.name,
        value: v.value,
      }))
    })
  })
}

const patchSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  password: z.string(),
});

const patchIndex = (app: Hono) => {
  app.patch("/:voteId", zValidator("json", patchSchema), async(c) => {
    const {title, content, password} = c.req.valid("json");
    
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
    
    if (!vote.password){
      return c.json({
        error: "Vote has no password",
      }, 401);
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
