import {Hono} from "hono";
import {getRequestIp} from "@/utils/getRequestIp";
import {prisma} from "@/lib/prisma";

export const registerApiRegister = (app: Hono) => {
  app.get("/:voteId/register/:value", async(c) => {
    const voteId = c.req.param("voteId");
    const value = c.req.param("value");
    
    const ip = getRequestIp(c);
    
    if (!voteId || !value || !ip) {
      return c.json({
        error: "Invalid request",
      }, 400);
    }
    
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
      options = JSON.parse(vote.options) as string[];
    } catch {
      return c.json({
        error: "Invalid vote options",
      }, 500);
    }
    if (!options.includes(value)){
      return c.json({
        error: "Invalid value",
      }, 400);
    }
    
    const answer = await createOrUpdateAnswer(voteId, value, ip);
    
    let answerOptions: string[];
    try {
      answerOptions = JSON.parse(answer.vote.options);
    } catch {
      return c.json({
        error: "Invalid vote options",
      }, 500);
    }
    
    return c.json({
      id: answer.vote.id,
      title: answer.vote.title,
      content: answer.vote.content,
      options: answerOptions,
      answer: {
        value: answer.value,
        name: answer.name,
      }
    });
  });
}

const createOrUpdateAnswer = async (voteId: string, value: string, ip: string) => {
  return prisma.answer.upsert({
    where: {
      ip_voteId: {
        ip,
        voteId,
      }
    },
    update: {
      value,
    },
    create: {
      voteId,
      ip,
      value,
    },
    include: {
      vote: true,
    }
  });
}
