/**
 * 前端指定文件名的下载工具
 * @param data 后端返回的原始数据 (Axios 响应对象 或 Blob/ArrayBuffer)
 * @param filename 要保存的文件名，如 '交换机导出.xlsx'
 */
export function downloadFile(data: any, filename: string) {
  if (!data) return;

  // 1. 提取真正的二进制体
  // 考虑到你用了拦截器，这里的 data 可能是 response.data，也可能是 response 本身
  const blobContent = data.data || data;

  // 2. 确保它是一个真正的 Blob
  const blob = blobContent instanceof Blob 
    ? blobContent 
    : new Blob([blobContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  // 3. 执行下载
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.href = url;
  link.download = filename; // 这里直接使用你传入的名字
  
  // 隐藏 link 避免影响布局
  link.style.display = "none";
  document.body.appendChild(link);
  
  link.click();

  // 4. 清理内存（稍微延迟以防某些浏览器下载中断）
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 100);
}