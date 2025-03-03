import Link from 'next/link'
import { getAllPosts } from '../../lib/notion'
import { formatDate } from 'pliny/utils/formatDate'
import Tag from '../../components/Tag'

export const metadata = {
  title: 'Notion Blog',
  description: 'Bài viết từ Notion Database',
}

export default async function NotionBlogPage() {
  const posts = await getAllPosts()

  if (!posts || posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Notion Blog</h1>
        <div className="text-center py-20">
          <p className="text-lg text-gray-600">
            Không có bài viết nào. Hãy kiểm tra lại cấu hình Notion API.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Notion Blog</h1>
      <div className="divide-y divide-gray-200">
        {posts.map((post) => (
          <article key={post.id} className="py-8">
            <div className="space-y-2 md:grid md:grid-cols-4 md:space-y-0 md:items-baseline">
              <div className="md:col-span-3">
                <h2 className="text-2xl font-bold tracking-tight">
                  <Link
                    href={`/notion-blog/${post.slug}`}
                    className="text-primary-500 hover:text-primary-600"
                  >
                    {post.title}
                  </Link>
                </h2>
                <div className="flex flex-wrap my-3">
                  {post.tags.map((tag) => (
                    <Tag key={tag} text={tag} />
                  ))}
                </div>
                <p className="text-gray-500">{post.summary}</p>
              </div>
              <div className="text-gray-500 md:text-right">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <div className="text-sm">Tác giả: {post.author}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
