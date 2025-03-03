import { Client } from '@notionhq/client'
import { cache } from 'react'

// Khởi tạo Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

// Database ID của database blog trong Notion
const databaseId = process.env.NOTION_DATABASE_ID

// Hàm cached để lấy tất cả các bài viết từ Notion
export const getAllPosts = cache(async () => {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Published',
        checkbox: {
          equals: true,
        },
      },
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    })

    return response.results.map((page) => {
      return formatPost(page)
    })
  } catch (error) {
    console.error('Error fetching posts from Notion:', error)
    return []
  }
})

// Hàm để lấy bài viết theo slug
export const getPostBySlug = cache(async (slug) => {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Slug',
        rich_text: {
          equals: slug,
        },
      },
    })

    if (!response.results.length) {
      return null
    }

    const page = response.results[0]
    return formatPost(page)
  } catch (error) {
    console.error(`Error fetching post with slug ${slug}:`, error)
    return null
  }
})

// Hàm để lấy nội dung chi tiết của bài viết
export const getPostContent = cache(async (pageId) => {
  try {
    const response = await notion.blocks.children.list({
      block_id: pageId,
    })

    return formatBlocks(response.results)
  } catch (error) {
    console.error(`Error fetching post content with ID ${pageId}:`, error)
    return []
  }
})

// Hàm format dữ liệu bài viết từ Notion
function formatPost(page) {
  const properties = page.properties

  return {
    id: page.id,
    title: properties.Title.title[0]?.plain_text || 'Untitled',
    slug: properties.Slug.rich_text[0]?.plain_text,
    date: properties.Date.date?.start,
    summary: properties.Summary.rich_text[0]?.plain_text || '',
    tags: properties.Tags.multi_select.map((tag) => tag.name) || [],
    author: properties.Author.select?.name || 'Anonymous',
    // Có thể thêm các trường khác nếu cần
  }
}

// Hàm format các block nội dung từ Notion
function formatBlocks(blocks) {
  return blocks.map((block) => {
    const { type, id } = block
    const value = block[type]

    switch (type) {
      case 'paragraph':
        return {
          id,
          type: 'paragraph',
          text: value.rich_text.map((t) => t.plain_text).join(''),
          annotations: value.rich_text.map((t) => t.annotations),
        }
      case 'heading_1':
        return {
          id,
          type: 'heading_1',
          text: value.rich_text.map((t) => t.plain_text).join(''),
        }
      case 'heading_2':
        return {
          id,
          type: 'heading_2',
          text: value.rich_text.map((t) => t.plain_text).join(''),
        }
      case 'heading_3':
        return {
          id,
          type: 'heading_3',
          text: value.rich_text.map((t) => t.plain_text).join(''),
        }
      case 'bulleted_list_item':
        return {
          id,
          type: 'bulleted_list_item',
          text: value.rich_text.map((t) => t.plain_text).join(''),
        }
      case 'numbered_list_item':
        return {
          id,
          type: 'numbered_list_item',
          text: value.rich_text.map((t) => t.plain_text).join(''),
        }
      case 'to_do':
        return {
          id,
          type: 'to_do',
          text: value.rich_text.map((t) => t.plain_text).join(''),
          checked: value.checked,
        }
      case 'toggle':
        return {
          id,
          type: 'toggle',
          text: value.rich_text.map((t) => t.plain_text).join(''),
        }
      case 'code':
        return {
          id,
          type: 'code',
          text: value.rich_text.map((t) => t.plain_text).join(''),
          language: value.language,
        }
      case 'image':
        return {
          id,
          type: 'image',
          url: value.type === 'external' ? value.external.url : value.file.url,
          caption: value.caption.length ? value.caption[0].plain_text : '',
        }
      default:
        return { id, type, value }
    }
  })
}
