import {prisma} from "@/lib/prisma";
import {isPasswordValid} from "@/lib/password";
import {Hono} from "hono";

export const registerApiV1VotesVoteIdResult = (app: Hono) => {
  app.get("/:voteId/result", async(c)=>{
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