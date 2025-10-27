import type { Song } from '../../domain'
import { listSongs } from '../../domain'

interface Response {
  data: Song[]
}

interface Input {
  channelIds?: string[]
}

export default defineEventHandler(async (event): Promise<Response> => {
  if (event.method !== 'GET') {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
  }

  return await listSongs(getQuery<Input>(event))
})
