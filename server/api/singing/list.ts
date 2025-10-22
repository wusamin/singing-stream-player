interface Song {
  id: string
  video: {
    id: string
    title: string
    publishedAt: Date
  }
  meta: {
    title: string
    artist: string
  }
  startAt: number
  endAt: number
}

interface Response {
  data: Song[]
}

export default defineEventHandler<Response>((event) => {
  return {
    data: [
      {
        id: '1',
        video: {
          id: 'nP6XESdY_Xk',
          title:
            '【お料理配信】花火大会の人気メニュー！？はしまき作ります【兎ノ花ののち/Varium】',
          publishedAt: new Date('2020-08-10T09:00:00Z'),
        },
        meta: {
          title: '打上花火',
          artist: 'DAOKO×米津玄師',
        },
        startAt: 3501,
        endAt: 3769,
      },
      {
        id: '2',
        video: {
          id: 'aS6UJoXrjsY',
          title:
            '【感謝】誕生日と半年記念ありがとうございます…！！【兎ノ花ののち/Varium】',
          publishedAt: new Date('2025-10-10T09:00:00Z'),
        },
        meta: {
          title: '栄光の架橋',
          artist: 'ゆず',
        },
        startAt: 3501,
        endAt: 3769,
      },
    ],
  }
})
