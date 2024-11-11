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
      
      return c.json({
        id: vote.id,
        title: vote.title,
        content: `${vote.content}\n\n投票後に名前を登録してください`,
        options: JSON.parse(vote.options),
        answer: null,
      });
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
