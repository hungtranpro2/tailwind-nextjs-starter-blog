// Đây là file cấu hình kết hợp cho cả markdown và notion
const mainContentlayerConfig = require('./contentlayer.config.ts')
const { Blog, Authors } = mainContentlayerConfig
const { defineDatabase, makeSource } = require('contentlayer-source-notion')
const notion = require('@notionhq/client')
const readingTime = require('reading-time')
const { slug } = require('github-slugger')

// Khởi tạo Notion client
const client = new notion.Client({
  auth: process.env.NOTION_TOKEN,
})

// Đây là cấu hình cho Notion
const NotionPost = defineDatabase(() => ({
  name: 'NotionPost',
  databaseId: process.env.NOTION_DATABASE_ID || '',
  computedFields: {
    slug: {
      type: 'string',
      resolve: (post) => {
        if (post.properties.Slug?.rich_text?.[0]?.plain_text) {
          return post.properties.Slug.rich_text[0].plain_text
        }
        return slug(post.properties.Title.title[0]?.plain_text || 'untitled')
      },
    },
    readingTime: {
      type: 'json',
      resolve: (post) => {
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

// Export cả cấu hình chính và Notion
module.exports = {
  // Cấu hình chính cho Markdown
  ...mainContentlayerConfig,
  
  // Thêm cấu hình Notion
  notionSource: makeSource({
    client,
    databaseTypes: [NotionPost],
  })
}
