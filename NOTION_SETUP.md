# Hướng dẫn thiết lập Notion Database cho Blog

## 1. Tạo Notion Integration

1. Truy cập [Notion Developers](https://www.notion.so/my-integrations)
2. Nhấp vào "Create new integration"
3. Đặt tên cho integration (ví dụ: "My Blog")
4. Chọn workspace của bạn từ dropdown
5. Nhấp vào "Submit"
6. Sao chép "Internal Integration Token" và lưu lại (đây sẽ là `NOTION_TOKEN` trong file .env)

## 2. Tạo Notion Database

1. Truy cập [Notion](https://www.notion.so/)
2. Tạo một trang mới
3. Tạo một database mới bằng cách nhấp vào "+ New" và chọn "Table view"
4. Tùy chỉnh database để có các thuộc tính sau:
   - Title (mặc định, kiểu Title)
   - Slug (kiểu Text)
   - Date (kiểu Date)
   - Summary (kiểu Text)
   - Author (kiểu Select)
   - Tags (kiểu Multi-select)
   - Published (kiểu Checkbox)

## 3. Kết nối Notion Integration với Database

1. Mở Database bạn vừa tạo trong Notion
2. Nhấp vào "..." ở góc trên bên phải
3. Chọn "Add connections"
4. Tìm và chọn integration bạn đã tạo ở bước 1
5. Nhấp vào "Confirm"

## 4. Lấy Database ID

1. Mở Database bạn vừa tạo trong Notion
2. Nhìn vào URL trên trình duyệt, bạn sẽ thấy URL có dạng:
   `https://www.notion.so/workspace/[database-id]?v=...`
3. Sao chép [database-id] (chuỗi dài các ký tự và số)
4. Lưu giá trị này làm `NOTION_DATABASE_ID` trong file .env

## 5. Cấu hình .env file

Điền thông tin vào file .env:

```
NOTION_TOKEN=your_integration_token_here
NOTION_DATABASE_ID=your_database_id_here
```

## 6. Tạo nội dung trong Notion

1. Thêm bài viết vào database Notion
2. Mỗi bài viết cần có:
   - Title: Tiêu đề bài viết
   - Slug: URL slug của bài viết (không dấu cách, không ký tự đặc biệt)
   - Date: Ngày đăng bài
   - Summary: Tóm tắt ngắn về bài viết
   - Author: Tên tác giả
   - Tags: Các thẻ liên quan
   - Published: Đánh dấu là `true` khi muốn bài viết xuất hiện trên trang web

3. Viết nội dung bài viết trong Notion, sử dụng đầy đủ các tính năng của Notion

## 7. Chạy ứng dụng

Sau khi hoàn thành các bước trên, khởi động lại ứng dụng Next.js:

```bash
npm run dev
```

Truy cập vào đường dẫn `/notion-blog` để xem các bài viết từ Notion database của bạn.
