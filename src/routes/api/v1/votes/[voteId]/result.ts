import {prisma} from "@/lib/prisma";
import {isPasswordValid} from "@/lib/password";
import {extractBasicAuthPassword} from "@/utils/basicAuth";
import {Hono} from "hono";

export const registerApiV1VotesVoteIdResult = (app: Hono) => {
  app.get("/:voteId/result", async(c)=>{
    const basicAuth = c.req.header("Authorization");
    if (!basicAuth){
      return c.json({
        error: "Unauthorized"
      }, 401)
    }
    const password = extractBasicAuthPassword(basicAuth);
    const voteId = c.req.param("voteId");
    
    const vote = await prisma.vote.findUnique({
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