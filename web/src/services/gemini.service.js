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
                temperature: 0.2,
                maxOutputTokens: 1024,
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

/**
 * Tóm tắt nội dung PDF workshop đã được trích xuất thành text.
 * @param {string} pdfText - Nội dung text thuần túy đã trích xuất từ PDF
 * @returns {Promise<{ briefSummary: string, detailedSummary: string, hashtags: string[] }>}
 */
const summarizePdfContent = async (pdfText) => {
    if (!pdfText || pdfText.trim().length < 30) {
        throw new Error('Nội dung PDF quá ngắn hoặc trống.');
    }

    // Cắt bớt nếu quá dài (tăng giới hạn lên 20,000 ký tự)
    const truncatedText = pdfText.substring(0, 20000);

    const prompt = `Bạn là trợ lý AI của UniHub Workshop. 
Dưới đây là nội dung trích xuất từ file PDF giới thiệu workshop.
Hãy tạo 2 phiên bản tóm tắt và danh sách hashtag.

KHÔNG chào hỏi, KHÔNG dùng icon, CHỈ in ra ĐÚNG định dạng sau:

[BRIEF_SUMMARY]
(Viết 1-2 câu cực kỳ ngắn gọn để hiển thị ở thẻ tóm tắt nhanh)

[DETAILED_SUMMARY]
(Trình bày chi tiết, đầy đủ về nội dung, lộ trình và mục tiêu của workshop. Đảm bảo cung cấp đủ thông tin để người đọc hiểu rõ giá trị của buổi học. Sử dụng dấu gạch đầu dòng '-' cho các ý chính và viết thành các đoạn văn mạch lạc. KHÔNG viết quá ngắn, không lược bỏ thông tin quan trọng)

[HASHTAGS]
tag1, tag2, tag3, tag4, tag5

--- NỘI DUNG PDF ---
${truncatedText}
--- HẾT ---`;

    const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 4096,
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

    console.log('[Gemini PDF Summary Raw]', text);

    let briefSummary = '';
    let detailedSummary = '';
    let hashtags = [];

    try {
        // Cách tách mới: Tách theo các block [SECTION]
        const sections = text.split(/\[(BRIEF_SUMMARY|DETAILED_SUMMARY|HASHTAGS)\]/i);
        
        for (let i = 1; i < sections.length; i += 2) {
            const sectionName = sections[i].toUpperCase();
            const sectionContent = sections[i + 1]?.trim() || '';
            
            if (sectionName === 'BRIEF_SUMMARY') briefSummary = sectionContent;
            if (sectionName === 'DETAILED_SUMMARY') detailedSummary = sectionContent;
            if (sectionName === 'HASHTAGS') {
                hashtags = sectionContent.split(',').map(tag => tag.trim().replace(/^#/, '')).filter(tag => tag !== '');
            }
        }

        // Fallback nếu parse lỗi hoặc trống
        if (!briefSummary && !detailedSummary) {
            briefSummary = text.substring(0, 200).trim() + '...';
            detailedSummary = text;
        } else if (!detailedSummary && briefSummary) {
            detailedSummary = briefSummary;
        } else if (!briefSummary && detailedSummary) {
            briefSummary = detailedSummary.substring(0, 150).trim() + '...';
        }
    } catch (error) {
        console.error('[PDF Extraction Error]', error);
        briefSummary = "Không thể phân tách nội dung.";
        detailedSummary = text;
    }

    return { briefSummary, detailedSummary, hashtags };
};

const geminiService = { summarizeWorkshop, summarizePdfContent };
export default geminiService;