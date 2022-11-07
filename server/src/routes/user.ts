import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";


export async function usersRoutes(fastify: FastifyInstance){
  fastify.get('/users/count', async () => {
    //contagem de usuarios
    const count = await prisma.user.count()

    return {count}
  })
}