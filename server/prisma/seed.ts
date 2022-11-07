import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.create({
    data: {
      name: 'Pedro Henrique',
      email: 'pedro@teste.com',
      avatarUrl: 'http://github.com/pedrohenriquelimasilva.png',
    }
  })

  const pool = await prisma.pool.create({
    data: {
      title: 'First Pool',
      code: 'FIRST1',
      ownerId: user.id,

      Participant:{
        create:{
          userId: user.id
        }
      }
    }
  })

  await prisma.game.create({
    data:{
      date: '2022-11-02T12:00:00.201Z',
      firstTeamCountryCode: 'BR',
      secundTeamCountryCode: 'US', 
      
      guesses:{
        create:{
          firstTeamPoints: 2,
          secundTeamPoints: 3,

          participant:{
            connect:{
              userId_poolId:{
                userId: user.id,
                poolId: pool.id
              }
            }
          }
        }
      }
    }
  })

  await prisma.game.create({
    data:{
      date: '2022-11-02T12:00:00.201Z',
      firstTeamCountryCode: 'BR',
      secundTeamCountryCode: 'AR',

      
    }
  })
}

main()