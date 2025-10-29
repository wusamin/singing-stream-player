import type { Channel, Song } from '../../domain'
import { listSongs } from '../../domain'

interface Response {
  data: Song[]
  channels: Channel[]
}

interface Input {
  channelIds?: string
}

export default defineEventHandler(async (event): Promise<Response> => {
  if (event.method !== 'GET') {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
  }
  const input = getQuery<Input>(event)
  return await listSongs({
    ...input,
    channelIds: input?.channelIds?.split(','),
  })
})
