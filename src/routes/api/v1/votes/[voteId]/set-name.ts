import {Hono} from "hono";
import {prisma} from "@/lib/prisma";
import {getRequestIp} from "@/utils/getRequestIp";

export const registerApiSetName = (app: Hono) => {
  app.get("/:voteId/set-name/:name", async(c) => {
    const voteId = c.req.param("voteId");
    const rawName = c.req.param("name");
    // VRChatのURL Input形式 (/set-name/---名前を入力--->) からプレフィックスを除去
    const name = rawName.replace(/^.*?-->/g, "").trim();
    if (!name || name.length > 100) {
      return c.json({
        error: "Invalid name",
      }, 400);
    }
    const ip = getRequestIp(c);
    
    const current = await prisma.answer.findUnique({
      where: {
        ip_voteId: {
          ip,
          voteId,
        }
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
        content: `${vote.content ?? ""}\n\n投票後に名前を登録してください`,
        options,
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
    
    let options: string[];
    try {
      options = JSON.parse(answer.vote.options);
    } catch {
      return c.json({
        error: "Invalid vote options",
      }, 500);
    }
    
    return c.json({
      id: answer.vote.id,
      title: answer.vote.title,
      content: answer.vote.content,
      options,
      answer: {
        value: answer.value,
        name: answer.name,
      }
    });
  });
}
