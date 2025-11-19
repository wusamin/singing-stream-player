import { getAuth } from 'firebase-admin/auth'
import type { Channel, Song, Video } from '../../domain'
import { listSongs } from '../../domain'

interface Response {
  data: Song[]
  videos: Video[]
  channels: Channel[]
}

interface Input {
  channelIds?: string
}

export default defineEventHandler(async (event): Promise<Response> => {
  if (event.method !== 'GET') {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
  }

  const auth = getAuth()

  const headers = getHeader(event, 'authorization')
  const idToken = headers?.replace('Bearer ', '')

  const token = idToken ? await auth.verifyIdToken(idToken) : null

  const input = getQuery<Input>(event)
  return await listSongs({
    ...input,
    channelIds: input?.channelIds?.split(','),
    authenticated: token !== null,
  })
})
