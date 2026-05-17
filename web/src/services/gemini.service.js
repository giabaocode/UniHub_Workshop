import { API_BASE_URL } from "../config/api";

/**
 * Trước đây gọi thẳng Gemini từ client => lộ API key, ai cũng có thể abuse.
 * Sau khi refactor: tất cả request AI đều đi qua backend admin endpoint
 * /api/admin/ai/* (yêu cầu role ADMIN). Gemini key giữ ở backend.
 */

const getAuthHeaders = () => {
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  if (!user?.token) {
    throw new Error("Vui lòng đăng nhập admin để dùng tính năng AI.");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${user.token}`,
    "ngrok-skip-browser-warning": "true",
  };
};

const parseError = async (response) => {
  try {
    const data = await response.json();
    return data.error || data.message || `AI service error ${response.status}`;
  } catch {
    return `AI service error ${response.status}`;
  }
};

const summarizeWorkshop = async ({ title, description, agenda = [] }) => {
  const response = await fetch(`${API_BASE_URL}/admin/ai/summarize-workshop`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, description, agenda }),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  const data = await response.json();
  return {
    summary: data.summary || "",
    hashtags: data.hashtags || [],
    raw: data.raw || "",
  };
};

/**
 * FE vẫn dùng pdfjs để trích xuất text (tránh tải nguyên file PDF lên server),
 * sau đó gửi text sang backend để tóm tắt.
 */
const summarizePdfContent = async (pdfText) => {
  const response = await fetch(`${API_BASE_URL}/admin/ai/summarize-pdf-text`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ pdfText }),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  const data = await response.json();
  return {
    briefSummary: data.briefSummary || "",
    detailedSummary: data.detailedSummary || "",
    hashtags: data.hashtags || [],
  };
};

const geminiService = { summarizeWorkshop, summarizePdfContent };
export default geminiService;
