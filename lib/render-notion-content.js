import React from 'react'
import Image from 'next/image'

// Component để render nội dung Notion
export function NotionRenderer({ blocks }) {
  if (!blocks || blocks.length === 0) {
    return <div>Không có nội dung</div>
  }

  const renderedBlocks = []
  let listItems = []
  let currentListType = null

  // Xử lý các block và gộp các list item liên tiếp lại với nhau
  blocks.forEach((block, index) => {
    const { type, id } = block

    if (type === 'bulleted_list_item' || type === 'numbered_list_item') {
      // Nếu loại list khác với loại list hiện tại, render list cũ và bắt đầu list mới
      if (currentListType && currentListType !== type) {
        renderedBlocks.push(renderList(currentListType, listItems))
        listItems = []
      }
      
      currentListType = type
      listItems.push(block)
      
      // Nếu đây là item cuối cùng hoặc block tiếp theo không phải là list, render list hiện tại
      if (index === blocks.length - 1 || 
          (blocks[index + 1].type !== 'bulleted_list_item' && 
           blocks[index + 1].type !== 'numbered_list_item')) {
        renderedBlocks.push(renderList(currentListType, listItems))
        listItems = []
        currentListType = null
      }
    } else {
      renderedBlocks.push(renderBlock(block))
    }
  })

  return <div className="notion-content">{renderedBlocks}</div>
}

// Xử lý text với các định dạng từ Notion
function renderRichText(text, annotations = []) {
  if (!text) return null

  let formattedText = text

  if (annotations && annotations.length > 0) {
    annotations.forEach((annotation) => {
      if (annotation.bold) {
        formattedText = <strong>{formattedText}</strong>
      }
      if (annotation.italic) {
        formattedText = <em>{formattedText}</em>
      }
      if (annotation.strikethrough) {
        formattedText = <del>{formattedText}</del>
      }
      if (annotation.underline) {
        formattedText = <u>{formattedText}</u>
      }
      if (annotation.code) {
        formattedText = <code className="bg-gray-100 rounded p-1 font-mono text-sm">{formattedText}</code>
      }
    })
  }

  return formattedText
}

// Xử lý danh sách từ Notion
function renderList(type, items) {
  const listItems = items.map((item) => (
    <li key={item.id} className="my-1">
      {renderRichText(item.text, item.annotations)}
    </li>
  ))

  if (type === 'bulleted_list_item') {
    return (
      <ul key={`list-${items[0].id}`} className="list-disc pl-5 my-4">
        {listItems}
      </ul>
    )
  } else {
    return (
      <ol key={`list-${items[0].id}`} className="list-decimal pl-5 my-4">
        {listItems}
      </ol>
    )
  }
}

// Xử lý từng loại block từ Notion
function renderBlock(block) {
  const { type, id } = block

  switch (type) {
    case 'paragraph':
      return (
        <p key={id} className="my-4">
          {renderRichText(block.text, block.annotations)}
        </p>
      )
    case 'heading_1':
      return (
        <h1 key={id} className="text-3xl font-bold mt-8 mb-4">
          {renderRichText(block.text)}
        </h1>
      )
    case 'heading_2':
      return (
        <h2 key={id} className="text-2xl font-bold mt-6 mb-3">
          {renderRichText(block.text)}
        </h2>
      )
    case 'heading_3':
      return (
        <h3 key={id} className="text-xl font-bold mt-5 mb-2">
          {renderRichText(block.text)}
        </h3>
      )
    case 'to_do':
      return (
        <div key={id} className="flex items-center my-2">
          <input
            type="checkbox"
            checked={block.checked}
            readOnly
            className="mr-2"
          />
          <span>{renderRichText(block.text)}</span>
        </div>
      )
    case 'toggle':
      return (
        <details key={id} className="my-4 p-2 border rounded">
          <summary className="cursor-pointer font-medium">
            {renderRichText(block.text)}
          </summary>
          {/* Nội dung của toggle có thể được xử lý thêm nếu cần */}
        </details>
      )
    case 'code':
      return (
        <div key={id} className="my-4">
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            <code className={`language-${block.language}`}>{block.text}</code>
          </pre>
          {block.language && (
            <div className="text-xs text-gray-500 mt-1">{block.language}</div>
          )}
        </div>
      )
    case 'image':
      return (
        <figure key={id} className="my-6">
          <div className="relative h-96 w-full">
            <Image
              src={block.url}
              alt={block.caption || 'Image'}
              fill
              className="object-contain"
            />
          </div>
          {block.caption && (
            <figcaption className="text-center text-sm text-gray-500 mt-2">
              {block.caption}
            </figcaption>
          )}
        </figure>
      )
    default:
      return (
        <div key={id} className="my-4">
          Không hỗ trợ hiển thị loại nội dung: {type}
        </div>
      )
  }
}
