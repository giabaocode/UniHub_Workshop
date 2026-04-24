// Các hàm tiện ích dùng chung cho toàn bộ dự án

export const handleNumberKeyDown = (e) => {
  if (
    ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(e.key) ||
    (e.key.startsWith('Arrow')) ||
    (['a', 'c', 'v', 'x'].includes(e.key.toLowerCase()) && (e.ctrlKey || e.metaKey))
  ) {
    return;
  }
  if (e.shiftKey || e.key < '0' || e.key > '9') {
    e.preventDefault();
  }
};