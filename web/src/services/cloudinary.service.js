const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const getMissingConfig = () => {
    const missing = [];
    if (!CLOUDINARY_CLOUD_NAME) missing.push('VITE_CLOUDINARY_CLOUD_NAME');
    if (!CLOUDINARY_UPLOAD_PRESET) missing.push('VITE_CLOUDINARY_UPLOAD_PRESET');
    return missing;
};

const assertConfig = () => {
    const missing = getMissingConfig();
    if (missing.length > 0) {
        throw new Error(`Thiếu cấu hình Cloudinary: ${missing.join(', ')}. Tạo file web/.env và restart Vite.`);
    }
};

const parseCloudinaryResponse = async (response) => {
    const text = await response.text();
    if (!text) return {};

    try {
        return JSON.parse(text);
    } catch {
        return { error: { message: text } };
    }
};

const upload = async (file, resourceType) => {
    assertConfig();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
        method: 'POST',
        body: formData,
    });

    const data = await parseCloudinaryResponse(response);
    if (!response.ok || !data.secure_url) {
        const message = data.error?.message || `Cloudinary upload failed with status ${response.status}`;
        throw new Error(message);
    }

    return data.secure_url;
};

const uploadImage = async (file) => {
    if (!file?.type?.startsWith('image/')) {
        throw new Error('Vui lòng chọn file hình ảnh hợp lệ.');
    }

    return upload(file, 'image');
};

const uploadPdf = async (file) => {
    const isPdf = file?.type === 'application/pdf' || file?.name?.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
        throw new Error('Chỉ chấp nhận file PDF.');
    }

    return upload(file, 'raw');
};

const cloudinaryService = {
    uploadImage,
    uploadPdf,
};

export default cloudinaryService;
