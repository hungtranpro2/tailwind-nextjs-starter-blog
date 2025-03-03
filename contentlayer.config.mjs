import { defineDocumentType, makeSource } from 'contentlayer2/source-files'
import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import { defineSourcePlugin } from 'contentlayer-source-notion'
import { writeFileSync } from 'fs'
import readingTime from 'reading-time'
import { slug } from 'github-slugger'
import path from 'path'
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'
// Remark packages
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { remarkAlert } from 'remark-github-blockquote-alert'
import {
  remarkExtractFrontmatter,
  remarkCodeTitles,
  remarkImgToJsx,
  extractTocHeadings,
} from 'pliny/mdx-plugins/index.js'
// Rehype packages
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeKatex from 'rehype-katex'
import rehypeKatexNoTranslate from 'rehype-katex-notranslate'
import rehypeCitation from 'rehype-citation'
import rehypePrismPlus from 'rehype-prism-plus'
import rehypePresetMinify from 'rehype-preset-minify'
import siteMetadata from './data/siteMetadata'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer.js'
import prettier from 'prettier'

const root = process.cwd()
const isProduction = process.env.NODE_ENV === 'production'

// heroicon mini link
const icon = fromHtmlIsomorphic(
  `
  <span class="content-header-link">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 linkicon">
  <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
  <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
  </svg>
  </span>
`,
  { fragment: true }
)

const computedFields = {
  readingTime: { type: 'json', resolve: (doc) => readingTime(doc.body.raw) },
  slug: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath.replace(/^.+?(\/)/, ''),
  },
  path: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath,
  },
  filePath: {
    type: 'string',
    resolve: (doc) => doc._raw.sourceFilePath,
  },
  toc: { type: 'json', resolve: (doc) => extractTocHeadings(doc.body.raw) },
}

/**
 * Count the occurrences of all tags across blog posts and write to json file
 */
async function createTagCount(allBlogs) {
  const tagCount = {}
  allBlogs.forEach((file) => {
    if (file.tags && (!isProduction || file.draft !== true)) {
      file.tags.forEach((tag) => {
        const formattedTag = slug(tag)
        if (formattedTag in tagCount) {
          tagCount[formattedTag] += 1
        } else {
          tagCount[formattedTag] = 1
        }
      })
    }
  })
  const formatted = await prettier.format(JSON.stringify(tagCount, null, 2), { parser: 'json' })
  writeFileSync('./app/tag-data.json', formatted)
}

function createSearchIndex(allBlogs) {
  if (
    siteMetadata?.search?.provider === 'kbar' &&
    siteMetadata.search.kbarConfig.searchDocumentsPath
  ) {
    writeFileSync(
      `public/${path.basename(siteMetadata.search.kbarConfig.searchDocumentsPath)}`,
      JSON.stringify(allCoreContent(sortPosts(allBlogs)))
    )
    console.log('Local search index generated...')
  }
}

export const Blog = defineDocumentType(() => ({
  name: 'Blog',
  filePathPattern: 'blog/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    tags: { type: 'list', of: { type: 'string' }, default: [] },
    lastmod: { type: 'date' },
    draft: { type: 'boolean' },
    summary: { type: 'string' },
    images: { type: 'list', of: { type: 'string' } },
    authors: { type: 'list', of: { type: 'string' } },
    layout: { type: 'string' },
    bibliography: { type: 'string' },
    canonicalUrl: { type: 'string' },
  },
  computedFields: {
    ...computedFields,
    structuredData: {
      type: 'json',
      resolve: (doc) => ({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: doc.title,
        datePublished: doc.date,
        dateModified: doc.lastmod || doc.date,
        description: doc.summary,
        image: doc.images ? doc.images[0] : siteMetadata.socialBanner,
        url: `${siteMetadata.siteUrl}/${doc._raw.flattenedPath}`,
      }),
    },
  },
}))

export const Authors = defineDocumentType(() => ({
  name: 'Authors',
  filePathPattern: 'authors/**/*.mdx',
  contentType: 'mdx',
  fields: {
    name: { type: 'string', required: true },
    avatar: { type: 'string' },
    occupation: { type: 'string' },
    company: { type: 'string' },
    email: { type: 'string' },
    twitter: { type: 'string' },
    linkedin: { type: 'string' },
    github: { type: 'string' },
    layout: { type: 'string' },
  },
  computedFields,
}))

// Định nghĩa NotionPost Document Type
export const NotionPost = defineDocumentType(() => ({
  name: 'NotionPost',
  filePathPattern: 'notion/**/*.md',
  contentType: 'markdown',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    summary: { type: 'string' },
    tags: { type: 'list', of: { type: 'string' }, default: [] },
    published: { type: 'boolean', default: true },
    author: { type: 'string' },
    notionId: { type: 'string', required: true }
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.md$/, '')
    },
    readingTime: {
      type: 'json',
      resolve: (doc) => readingTime(doc.body.raw)
    },
  },
}))

// Thiết lập Notion client
const notionClient = new Client({
  auth: process.env.NOTION_TOKEN
})

// Thiết lập converter từ Notion sang Markdown
const n2m = new NotionToMarkdown({ notionClient })

// Plugin cho ContentLayer để kết nối với Notion
const NotionPlugin = defineSourcePlugin(({ contentDir, contentType, fieldOptions }) => {
  const databaseId = process.env.NOTION_DATABASE_ID

  return {
    name: 'notion',
    fetchContent: async () => {
      if (!databaseId || !process.env.NOTION_TOKEN) {
        console.warn('NOTION_TOKEN hoặc NOTION_DATABASE_ID chưa được cấu hình!')
        return []
      }

      try {
        // Lấy tất cả trang từ Notion database
        const response = await notionClient.databases.query({
          database_id: databaseId,
          filter: {
            property: 'Published',
            checkbox: {
              equals: true
            }
          }
        })

        // Xử lý từng trang và chuyển đổi sang Markdown
        const pages = await Promise.all(
          response.results.map(async (page) => {
            const mdBlocks = await n2m.pageToMarkdown(page.id)
            const mdString = n2m.toMarkdownString(mdBlocks)
            
            // Trích xuất thông tin từ properties
            const titleProperty = page.properties.Title?.title
            const dateProperty = page.properties.Date?.date
            const summaryProperty = page.properties.Summary?.rich_text
            const tagsProperty = page.properties.Tags?.multi_select
            const authorProperty = page.properties.Author?.select
            const slugProperty = page.properties.Slug?.rich_text
            
            const title = titleProperty?.[0]?.plain_text || 'Untitled'
            const date = dateProperty?.start || new Date().toISOString().split('T')[0]
            const summary = summaryProperty?.[0]?.plain_text || ''
            const tags = tagsProperty?.map(tag => tag.name) || []
            const author = authorProperty?.name || 'Anonymous'
            const slugText = slugProperty?.[0]?.plain_text || slug(title)
            
            // Tạo tên file và đường dẫn
            const fileName = `${slugText}.md`
            const fileContent = `---
title: ${title}
date: ${date}
summary: ${summary}
tags: ${JSON.stringify(tags)}
author: ${author}
published: true
notionId: ${page.id}
---

${mdString.parent}
`
            
            // Lưu file vào thư mục data/notion
            const filePath = path.join(process.cwd(), 'data', 'notion', fileName)
            try {
              // Đảm bảo thư mục tồn tại
              const fs = await import('fs/promises')
              await fs.mkdir(path.dirname(filePath), { recursive: true })
              await fs.writeFile(filePath, fileContent)
            } catch (err) {
              console.error(`Không thể lưu file ${filePath}`, err)
            }

            return {
              fileName,
              filePath
            }
          })
        )

        return pages
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu từ Notion:', error)
        return []
      }
    }
  }
})

export default makeSource({
  contentDirPath: 'data',
  documentTypes: [Blog, Authors, NotionPost],
  mdx: {
    cwd: process.cwd(),
    remarkPlugins: [
      remarkExtractFrontmatter,
      remarkGfm,
      remarkCodeTitles,
      remarkMath,
      remarkImgToJsx,
      remarkAlert,
    ],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'prepend',
          test: ['h2', 'h3', 'h4', 'h5', 'h6'],
          properties: { className: ['anchor'] },
          content: icon.children,
        },
      ],
      rehypeKatex,
      rehypeKatexNoTranslate,
      [
        rehypeCitation,
        { path: path.join(root, 'data') }
      ],
      [rehypePrismPlus, { showLineNumbers: false }],
      rehypePresetMinify,
    ],
  },
  onSuccess: async (importData) => {
    const { allBlogs } = await importData()
    createTagCount(allBlogs)
    createSearchIndex(allBlogs)
  },
  plugins: [
    NotionPlugin({})
  ]
})
