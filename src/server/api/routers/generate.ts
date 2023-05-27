import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.DALLE_API_KEY,
});
const openai = new OpenAIApi(configuration);




export const generateRouter = createTRPCRouter({
  generateIcon: protectedProcedure.input(
    z.object({
        prompt:z.string()
    })
  ).mutation(async ({ctx,input})=>{
    console.log('we are here.',input.prompt);
   // verify user have enough credit
    const {count}= await ctx.prisma.user.updateMany({
      where:{ 
        id:ctx.session.user.id, 
        credits:{
          gte:1
        }
      },
      data:{
        credits:{
        decrement:1,
        }
      }
    })

    if (count<=0){
      throw new TRPCError({
        code:"BAD_REQUEST",
        message:'you do not have enough credits.'
      })
    }
    // make a fetch request to dalle api
    const response = await openai.createImage({
      prompt: input.prompt,
      n: 1,
      size: "1024x1024",
    })    
    const image_url= response.data.data[0]?.url

    return{
        image_url:image_url,
      };
    })
});
