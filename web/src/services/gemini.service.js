const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const summarizeWorkshop = async ({ title, description, agenda = [] }) => {
    const agendaText = agenda.length > 0
        ? agenda.map((item, i) => `${i + 1}. ${item}`).join('\n')
        : '(Không có danh sách cụ thể)';

    // BỎ JSON. Yêu cầu AI in ra theo form có sẵn [SUMMARY] và [HASHTAGS]
    const prompt = `Đọc thông tin workshop và tóm tắt.
KHÔNG chào hỏi, KHÔNG dùng icon, CHỈ in ra ĐÚNG định dạng sau:

[SUMMARY]
Viết 2-3 câu tóm tắt tại đây.
[HASHTAGS]
kynang, phongvan, sinhvien

Thông tin:
Tên: ${title}
Mô tả: ${description}
Chương trình: ${agendaText}`;

    const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.2, // Mức nhiệt độ thấp giúp AI bám sát mẫu
                maxOutputTokens: 512,
            }
        }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `Gemini API error ${response.status}`);
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text) throw new Error('Gemini không trả về nội dung.');

    console.log('[Gemini Raw Text]', text);

    // 1. DỌN DẸP RÁC: Xóa các icon hoặc câu chào AI hay tự động chêm vào
    text = text.replace(/🤖|AI Tóm tắt:|Dạ,|Dưới đây là/gi, '').trim();

    // 2. TÁCH DỮ LIỆU:
    let summary = "Không thể tạo tóm tắt do lỗi dữ liệu.";
    let hashtags = [];

    try {
        // Tách lấy phần Tóm tắt (Nằm giữa [SUMMARY] và [HASHTAGS])
        const summaryMatch = text.match(/\[SUMMARY\]([\s\S]*?)\[HASHTAGS\]/i);
        if (summaryMatch) {
            summary = summaryMatch[1].trim();
        } else {
            // Nếu AI quên in [HASHTAGS], lấy từ sau [SUMMARY] đến hết
            summary = text.replace(/\[SUMMARY\]/i, '').split(/\[HASHTAGS\]/i)[0].trim();
        }

        // Tách lấy phần Hashtag (Nằm sau [HASHTAGS])
        const tagsMatch = text.match(/\[HASHTAGS\]([\s\S]*)/i);
        if (tagsMatch) {
            const rawTags = tagsMatch[1].trim();
            // Cắt chuỗi bằng dấu phẩy, xóa khoảng trắng và xóa dấu # (nếu AI lỡ thêm)
            hashtags = rawTags.split(',').map(tag => tag.trim().replace(/^#/, '')).filter(tag => tag !== '');
        }
    } catch (error) {
        console.error('[Extraction Error]', error);
        summary = text; // Fallback: Nếu lỗi trích xuất, in ra toàn bộ kết quả đã dọn dẹp
    }

    return { summary, hashtags };
};

const geminiService = { summarizeWorkshop };
export default geminiService;