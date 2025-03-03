import Link from 'next/link'
import { formatDate } from '../../lib/utils/formatDate' 
import Tag from '../../components/Tag'

// Dữ liệu mẫu
const SAMPLE_POSTS = [
  {
    _id: '1',
    slug: 'sample-post-1',
    publishedAt: '2023-01-01',
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
    properties: {
      Title: { title: [{ plain_text: 'Bài viết mẫu 2' }] },
      Summary: { rich_text: [{ plain_text: 'Kiểm tra tích hợp Notion với ContentLayer.' }] },
      Tags: { multi_select: [{ name: 'Next.js' }, { name: 'React' }] },
      Author: { select: { name: 'Admin' } }
    }
  }
];

export const metadata = {
  title: 'Notion Blog với ContentLayer',
  description: 'Bài viết từ Notion Database sử dụng ContentLayer',
}

export default function NotionContentLayerPage() {
  // Hiện tại chỉ sử dụng dữ liệu mẫu
  const posts = SAMPLE_POSTS;
  const hasNotionPosts = false; // Tạm thởi đánh dấu chưa có dữ liệu từ Notion
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Notion Blog với ContentLayer</h1>
      
      {!hasNotionPosts && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <p className="text-yellow-700">
            <strong>Lưu ý:</strong> Hiện đang hiển thị dữ liệu mẫu vì chưa thể lấy được dữ liệu từ Notion. 
            Đang trong quá trình cấu hình Contentlayer-Notion. Để sử dụng dữ liệu thật từ Notion, hãy đảm bảo:
          </p>
          <ol className="list-decimal ml-5 text-yellow-700 mt-2">
            <li>Đã cấu hình đúng NOTION_TOKEN và NOTION_DATABASE_ID trong .env</li>
            <li>Đã cài đặt đúng các gói contentlayer-source-notion và @notionhq/client</li>
            <li>Đã khởi động lại máy chủ phát triển sau khi cấu hình</li>
          </ol>
        </div>
      )}
      
      {hasNotionPosts && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-8">
          <p className="text-green-700">
            <strong>Thành công!</strong> Đã kết nối thành công với Notion và hiển thị dữ liệu thông qua ContentLayer.
          </p>
        </div>
      )}
      
      <div className="divide-y divide-gray-200">
        {posts.map((post) => (
          <article key={post._id} className="py-8">
            <div className="space-y-2 md:grid md:grid-cols-4 md:space-y-0 md:items-baseline">
              <div className="md:col-span-3">
                <h2 className="text-2xl font-bold tracking-tight">
                  <Link
                    href={`/notion-contentlayer/${post.slug}`}
                    className="text-primary-500 hover:text-primary-600"
                  >
                    {post.properties.Title.title[0]?.plain_text || 'Không có tiêu đề'}
                  </Link>
                </h2>
                <div className="flex flex-wrap my-3">
                  {post.properties.Tags?.multi_select?.map((tag) => (
                    <Tag key={tag.name} text={tag.name} />
                  ))}
                </div>
                <p className="text-gray-500">
                  {post.properties.Summary?.rich_text?.[0]?.plain_text ||
                    'Không có tóm tắt'}
                </p>
              </div>
              <div className="text-gray-500 md:text-right">
                <time dateTime={post.publishedAt}>
                  {formatDate(post.publishedAt)}
                </time>
                <div className="text-sm">
                  Tác giả: {post.properties.Author?.select?.name || 'Ẩn danh'}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
