import { makeSource, defineDatabase } from 'contentlayer-source-notion'
import * as notion from '@notionhq/client'
import readingTime from 'reading-time'
import { slug } from 'github-slugger'

// Khởi tạo Notion client
const client = new notion.Client({
  auth: process.env.NOTION_TOKEN,
})

// Định nghĩa loại dữ liệu Post từ Notion
const Post = defineDatabase(() => ({
  name: 'NotionPost',
  databaseId: process.env.NOTION_DATABASE_ID || '',
  computedFields: {
    slug: {
      type: 'string',
      resolve: (post) => {
        // Sử dụng trường Slug của bạn trong Notion hoặc tự động tạo slug từ tiêu đề
        if (post.properties.Slug?.rich_text?.[0]?.plain_text) {
          return post.properties.Slug.rich_text[0].plain_text
        }
        return slug(post.properties.Title.title[0]?.plain_text || 'untitled')
      },
    },
    readingTime: {
      type: 'json',
      resolve: (post) => {
        // Tính thời gian đọc dựa trên nội dung
        const content = post.properties.Content?.rich_text?.[0]?.plain_text || ''
        return readingTime(content)
      },
    },
    publishedAt: {
      type: 'date',
      resolve: (post) => post.properties.Date?.date?.start || '',
    },
  },
}))

// Tạo nguồn dữ liệu Notion
export default makeSource({
  client,
  databaseTypes: [Post],
})
