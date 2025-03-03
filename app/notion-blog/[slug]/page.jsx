import { getPostBySlug, getPostContent, getAllPosts } from '../../../lib/notion'
import { NotionRenderer } from '../../../lib/render-notion-content'
import { formatDate } from 'pliny/utils/formatDate'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PageTitle from '../../../components/PageTitle'
import Tag from '../../../components/Tag'

// Tạo metadata động cho từng bài viết
export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug)
  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: post.title,
    description: post.summary,
  }
}

// Tạo các tham số tĩnh cho các trang bài viết
export async function generateStaticParams() {
  const posts = await getAllPosts()
  
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function PostPage({ params }) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  const content = await getPostContent(post.id)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="xl:divide-y xl:divide-gray-200">
        <header className="pt-6 xl:pb-6">
          <div className="space-y-1 text-center">
            <div className="mb-4">
              <Link
                href="/notion-blog"
                className="text-primary-500 hover:text-primary-600"
              >
                &larr; Quay lại tất cả bài viết
              </Link>
            </div>
            <PageTitle>{post.title}</PageTitle>
            <div className="flex flex-wrap justify-center gap-2 py-4">
              {post.tags.map((tag) => (
                <Tag key={tag} text={tag} />
              ))}
            </div>
            <dl className="space-y-10">
              <div>
                <dt className="sr-only">Ngày đăng</dt>
                <dd className="text-base font-medium leading-6 text-gray-500">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                </dd>
              </div>
            </dl>
            {post.author && (
              <div className="text-gray-500">Tác giả: {post.author}</div>
            )}
          </div>
        </header>

        <div className="divide-y divide-gray-200 xl:divide-y-0">
          <div className="divide-y divide-gray-200 xl:col-span-3 xl:row-span-2 xl:pb-0">
            <div className="prose max-w-none pt-10 pb-8 dark:prose-invert">
              <NotionRenderer blocks={content} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
