import {Hono} from "hono";
import {prisma} from "@/lib/prisma";
import {getRequestIp} from "@/utils/getRequestIp";

export const registerApiSetName = (app: Hono) => {
  app.get("/:voteId/set-name/:name", async(c) => {
    const voteId = c.req.param("voteId");
    const name = c.req.param("name").replace(/^.*?-->/g, "").trim();
    const ip = getRequestIp(c);
    
    const answer = await prisma.answer.findFirst({
      where: {
        voteId,
        ip,
      }
    });
    
    if (!answer) {
      return c.json({
        error: "Answer not found",
      }, 404);
    }
    
    await prisma.answer.update({
      where: {
        id: answer.id,
      },
      data: {
        name,
      }
    });
    
    return c.json({
      voteId,
      name,
    });
  });
}
