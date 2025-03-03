# Hướng dẫn Tích hợp Notion với ContentLayer

Tài liệu này hướng dẫn cách sử dụng Notion làm nguồn dữ liệu cho ContentLayer, giúp tạo blog với Next.js và Tailwind CSS.

## Giới thiệu

Tính năng này kết hợp sức mạnh của:
- **Notion**: Nền tảng quản lý nội dung trực quan và dễ sử dụng
- **ContentLayer**: Thư viện quản lý nội dung cho Next.js, cung cấp tính năng kiểm tra kiểu dữ liệu
- **Next.js**: Framework React hiện đại

## Yêu cầu

1. **Notion API Token**
   - Truy cập [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
   - Tạo integration mới
   - Sao chép token để sử dụng

2. **Notion Database**
   - Tạo database trong Notion với các trường sau:
     - Title (title): Tiêu đề bài viết
     - Slug (rich text): URL slug
     - Date (date): Ngày xuất bản
     - Summary (rich text): Tóm tắt bài viết
     - Author (select): Tác giả
     - Tags (multi-select): Thẻ
     - Published (checkbox): Trạng thái xuất bản
   - Chia sẻ database với integration đã tạo ở bước 1
   - Sao chép Database ID từ URL (đoạn mã sau notion.so/)

3. **Cài đặt Thư viện**
   ```bash
   npm install contentlayer-source-notion @notionhq/client
   # hoặc
   yarn add contentlayer-source-notion @notionhq/client
   ```

## Cấu hình

### 1. Biến Môi trường

Thêm các biến môi trường vào file `.env`:

```
NOTION_TOKEN=your_notion_api_token
NOTION_DATABASE_ID=your_notion_database_id
```

### 2. Tạo Cấu hình ContentLayer cho Notion

Tạo file `contentlayer.notion.config.ts` trong thư mục gốc:

```typescript
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
        // Sử dụng trường Slug hoặc tạo slug từ tiêu đề
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

// Tạo nguồn dữ liệu Notion
export default makeSource({
  client,
  databaseTypes: [Post],
})
```

### 3. Cập nhật Next.js Config

Thêm cấu hình ContentLayer cho Notion vào `next.config.js`:

```javascript
const { withContentlayer } = require('next-contentlayer2')
const { withContentNotionLayer } = require('contentlayer-source-notion/next')

// Cấu hình hiện tại của bạn...
const nextConfig = {
  // Cấu hình hiện tại...
}

// Sử dụng cả hai plugin
module.exports = () => {
  const plugins = [withContentlayer, withContentNotionLayer]
  return plugins.reduce((acc, next) => next(acc), nextConfig)
}
```

## Sử dụng trong React Components

### 1. Trang Danh sách Bài viết

```jsx
import { allNotionPosts } from 'contentlayer-source-notion/generated'

export default function NotionBlogPage() {
  const posts = allNotionPosts.sort((a, b) => 
    new Date(b.publishedAt) - new Date(a.publishedAt)
  )

  return (
    <div>
      <h1>Notion Blog</h1>
      {posts.map((post) => (
        <article key={post._id}>
          <h2>
            <Link href={`/notion-blog/${post.slug}`}>
              {post.properties.Title.title[0]?.plain_text}
            </Link>
          </h2>
          <time>{post.publishedAt}</time>
        </article>
      ))}
    </div>
  )
}
```

### 2. Trang Chi tiết Bài viết

```jsx
import { allNotionPosts } from 'contentlayer-source-notion/generated'
import { notFound } from 'next/navigation'

export default function PostPage({ params }) {
  const post = allNotionPosts.find((post) => post.slug === params.slug)
  
  if (!post) {
    notFound()
  }

  return (
    <article>
      <h1>{post.properties.Title.title[0]?.plain_text}</h1>
      <time>{post.publishedAt}</time>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}
```

## Xử lý lỗi thường gặp

1. **Lỗi "Cannot find module 'contentlayer-source-notion'"**
   - Kiểm tra lại cài đặt `contentlayer-source-notion`
   - Khởi động lại server development

2. **Không tìm thấy dữ liệu từ Notion**
   - Kiểm tra token API và database ID
   - Đảm bảo database đã được chia sẻ với integration
   - Kiểm tra cấu trúc database và tên trường

3. **Lỗi kiểu dữ liệu**
   - Đảm bảo các trường trong Notion khớp với định nghĩa trong cấu hình ContentLayer

## Tài nguyên

- [Notion API Documentation](https://developers.notion.com/)
- [ContentLayer Documentation](https://www.contentlayer.dev/)
- [Next.js Documentation](https://nextjs.org/docs)

---

© 2023 - Tailwind Nextjs Starter Blog
