import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import {env} from "~/env.mjs"
import { Configuration, OpenAIApi } from "openai";
import AWS, { Credentials } from "aws-sdk";
import {b64Image} from "src/data/b64Image";

// connect to AWS
const s3= new AWS.S3({
  credentials:{
    accessKeyId:env.AWS_ACCESS_ID,
    secretAccessKey:env.AWS_ACCESS_SECRET_KEY
  },
  region:"us-east-1"
}
)




async function generateIcon(prompt: string): Promise<string|undefined> {
  if (env.MOCK_DALLE==='true'){
    return b64Image
    //return "https://picsum.photos/200/300";
  }
  else{
    const response = await openai.createImage({
      prompt,
      n: 1,
      size: "256x256",
      response_format:'b64_json'
    })    
    return response.data.data[0]?.b64_json
     
  }

}



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
    const base64Image=await generateIcon(input.prompt);

    //store data in sqlite db with prisma
    const icon = await ctx.prisma.icon.create({
      data:{
        prompt:input.prompt,
        userId:ctx.session.user.id,
      },
    })



    //TODO: save image to S3
    await s3.putObject({
      Bucket:'cruxmed-icon-generator',
      Body:Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ""),"base64"),
      Key:icon.id,
      ContentEncoding:"base64",
      ContentType:"image/png"
    }).promise();

    return {
      base64Image:base64Image
    }

    })
});
