import { formatDate } from '../../../lib/utils/formatDate'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PageTitle from '../../../components/PageTitle'
import Tag from '../../../components/Tag'

// Dữ liệu mẫu để hiển thị khi không có dữ liệu Notion
const SAMPLE_POSTS = [
  {
    _id: '1',
    slug: 'sample-post-1',
    publishedAt: '2023-01-01',
    content: '<p>Đây là nội dung bài viết mẫu 1. Bài viết này được tạo để kiểm tra giao diện hiển thị chi tiết bài viết từ Notion thông qua ContentLayer.</p><p>Trong tương lai, nội dung này sẽ được lấy từ Notion thông qua ContentLayer.</p>',
    properties: {
      Title: { title: [{ plain_text: 'Bài viết mẫu 1' }] },
      Summary: { rich_text: [{ plain_text: 'Đây là bài viết mẫu để kiểm tra giao diện.' }] },
      Tags: { multi_select: [{ name: 'Notion' }, { name: 'ContentLayer' }] },
      Author: { select: { name: 'Admin' } }
    }
  },
  {
    _id: '2',
    slug: 'sample-post-2',
    publishedAt: '2023-01-02',
    content: '<p>Đây là nội dung bài viết mẫu 2. Bài viết này được tạo để kiểm tra giao diện hiển thị chi tiết bài viết từ Notion thông qua ContentLayer.</p><p>Khi tích hợp hoàn chỉnh, dữ liệu sẽ được lấy trực tiếp từ Notion API và xử lý bởi ContentLayer.</p>',
    properties: {
      Title: { title: [{ plain_text: 'Bài viết mẫu 2' }] },
      Summary: { rich_text: [{ plain_text: 'Kiểm tra tích hợp Notion với ContentLayer.' }] },
      Tags: { multi_select: [{ name: 'Next.js' }, { name: 'React' }] },
      Author: { select: { name: 'Admin' } }
    }
  }
];

// Tạo metadata động cho từng bài viết
export async function generateMetadata({ params }) {
  // Sử dụng dữ liệu mẫu
  const post = SAMPLE_POSTS.find((post) => post.slug === params.slug);
  
  if (!post) {
    return {
      title: 'Không tìm thấy bài viết',
    }
  }

  return {
    title: post.properties.Title.title[0]?.plain_text || 'Không có tiêu đề',
    description: post.properties.Summary?.rich_text?.[0]?.plain_text || '',
  }
}

// Tạo các tham số tĩnh cho các trang bài viết
export async function generateStaticParams() {
  // Sử dụng dữ liệu mẫu
  return SAMPLE_POSTS.map((post) => ({
    slug: post.slug,
  }))
}

export default async function PostPage({ params }) {
  // Sử dụng dữ liệu mẫu
  const post = SAMPLE_POSTS.find((post) => post.slug === params.slug);

  if (!post) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="xl:divide-y xl:divide-gray-200">
        <header className="pt-6 xl:pb-6">
          <div className="space-y-1 text-center">
            <div className="mb-4">
              <Link
                href="/notion-contentlayer"
                className="text-primary-500 hover:text-primary-600"
              >
                &larr; Quay lại danh sách bài viết
              </Link>
            </div>
            <div>
              <PageTitle>
                {post.properties.Title.title[0]?.plain_text || 'Không có tiêu đề'}
              </PageTitle>
            </div>
            <div className="flex flex-wrap justify-center mt-2 space-x-2">
              {post.properties.Tags?.multi_select?.map((tag) => (
                <Tag key={tag.name} text={tag.name} />
              ))}
            </div>
            <dl className="space-y-10">
              <div>
                <dt className="sr-only">Đăng vào</dt>
                <dd className="text-base font-medium leading-6 text-gray-500">
                  <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                </dd>
              </div>
            </dl>
            <div>
              <dt className="sr-only">Tác giả</dt>
              <dd className="text-base font-medium leading-6 text-gray-500">
                {post.properties.Author?.select?.name || 'Ẩn danh'}
              </dd>
            </div>
          </div>
        </header>

        <div className="divide-y divide-gray-200 pb-8 xl:divide-y-0">
          <div className="divide-y divide-gray-200 xl:pb-0 xl:col-span-3 xl:row-span-2">
            <div className="pt-10 pb-8 prose max-w-none">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                <p className="text-yellow-700">
                  <strong>Lưu ý:</strong> Đây là dữ liệu mẫu. Để hiển thị dữ liệu thật từ Notion, 
                  vui lòng cấu hình đúng NOTION_TOKEN và NOTION_DATABASE_ID trong tệp .env và 
                  đảm bảo đã cài đặt tất cả các gói phụ thuộc cần thiết.
                </p>
              </div>
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
