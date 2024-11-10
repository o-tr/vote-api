import {Hono} from "hono";
import {prisma} from "@/lib/prisma";
import {getRequestIp} from "@/utils/getRequestIp";

export const registerApiSetName = (app: Hono) => {
  app.get("/:voteId/set-name/:name", async(c) => {
    const voteId = c.req.param("voteId");
    const name = c.req.param("name").replace(/^.*?-->/g, "").trim();
    const ip = getRequestIp(c);
    
    const current = await prisma.answer.findFirst({
      where: {
        voteId,
        ip,
      }
    });
    
    if (!current) {
      return c.json({
        error: "Answer not found",
      }, 404);
    }
    
    const answer = await prisma.answer.update({
      where: {
        id: current.id,
      },
      data: {
        name,
      },
      include:{
        vote: true,
      }
    });
    
    if (!answer.vote){
      return c.json({
        error: "Vote not found",
      }, 404);
    }
    
    return c.json({
      id: answer.vote.id,
      title: answer.vote.title,
      content: answer.vote.content,
      options: JSON.parse(answer.vote.options),
      answer: {
        value: answer.value,
        name: answer.name,
      }
    });
  });
}
