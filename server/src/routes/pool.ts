import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import ShortUniqueId from 'short-unique-id'

import {z} from 'zod'
import { authenticate } from "../plugins/authenticate";

export async function poolsRoutes(fastify: FastifyInstance){
  fastify.get('/pools/count', async () => {
    //contagem de bolao
    const count = await prisma.pool.count()

    return {count}
  })

  fastify.post('/pools', async (request, reply) => {
    const createPoolBody = z.object({
      title: z.string(),
    })

    const {title} = createPoolBody.parse(request.body)

    //create id random
    const generator = new ShortUniqueId({length: 6})
    const code = String(generator()).toUpperCase()

    try{
      await request.jwtVerify()

      await prisma.pool.create({
        data:{
          title,
          code,
          ownerId: request.user.sub,

          Participant:{
            create:{
              userId: request.user.sub
            }
          }
        }
      })
    } catch(err){
        await prisma.pool.create({
          data:{
            title,
            code,
          }
        })
    }

    

    reply.status(201).send({code})
  })

  fastify.post('/pools/join',{onRequest: [authenticate]} ,async (request, reply) => {
    const joinPoolBody = z.object({
      code: z.string(),
    })

    const { code } = await joinPoolBody.parse(request.body)

    const pool = await prisma.pool.findUnique({
      where:{
        code
      },
      include:{
        Participant:{
          where:{
            userId: request.user.sub
          }
        }
      }
    })

    if(!pool){
      return reply.status(400).send({
        message: 'Pool not found.'
      })
    }

    if(pool.Participant.length > 0){
      return reply.status(400).send({
        message: 'You already joined this pool.'
      })
    }

    if(!pool.ownerId){
      await prisma.pool.update({
        where:{
          id: pool.id
        },
        data: {
          ownerId: request.user.sub
        }
      })
    }

    await prisma.participant.create({
      data:{
        poolId: pool.id,
        userId: request.user.sub
      }
    })

    return reply.status(201).send()
  })

  fastify.get('/pools', {onRequest: [authenticate]} , async (request) => {
    const pools = await prisma.pool.findMany({
      where:{
        Participant:{
          some:{
            userId: request.user.sub
          }
        }
      },
      include:{
        owner:{ 
          select:{
            name:true,
            id: true
          }
        },
        _count:{
          select:{
            Participant: true,
          }
        },
        Participant:{
          select:{
            id: true,
            user:{
              select:{
                avatarUrl: true
              }
            }
          },
          take: 4,
        }
      }
    })

    return { pools }
  })

  fastify.get('/pools/:id', {onRequest: [authenticate]} , async (request) =>{
    const getPoolParams = z.object({
      id: z.string()
    })

    const {id} = getPoolParams.parse(request.params)

    const pool = await prisma.pool.findUnique({
      where:{
        id
      },
      include:{
        owner:{ 
          select:{
            name:true,
            id: true
          }
        },
        _count:{
          select:{
            Participant: true,
          }
        },
        Participant:{
          select:{
            id: true,
            user:{
              select:{
                avatarUrl: true
              }
            }
          },
          take: 4,
        }
      }
    })

    return {pool}
  })
}