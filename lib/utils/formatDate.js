/**
 * Định dạng ngày tháng theo định dạng mong muốn
 * @param {string|Date} date - Ngày cần định dạng
 * @returns {string} Chuỗi ngày đã định dạng
 */
export function formatDate(date) {
  if (!date) return ''
  
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  
  const now = new Date(date).toLocaleDateString('vi-VN', options)
  
  return now
}

export default formatDate
