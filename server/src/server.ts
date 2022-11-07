import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'

import { poolsRoutes } from './routes/pool'
import { usersRoutes } from './routes/user'
import { guessesRoutes } from './routes/guess'
import { gamesRoutes } from './routes/game'
import { authRoutes } from './routes/auth'


async function bootstrap(){

  const fastify = Fastify({
    logger: true
  })

  await fastify.register(cors, {
    origin: true
  })

  await fastify.register(jwt,{
    secret: 'testJWT'
  })

  await fastify.register(authRoutes)
  await fastify.register(poolsRoutes)
  await fastify.register(usersRoutes)
  await fastify.register(guessesRoutes)
  await fastify.register(gamesRoutes)

  await fastify.listen({port: 3333, host: '0.0.0.0'})
}

bootstrap()