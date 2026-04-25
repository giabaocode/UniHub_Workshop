// URL gốc của Backend (sau này đưa lên mạng thật chỉ cần đổi dòng này là xong)
const BASE_URL = "http://localhost:8080/api/workshops";

export const workshopService = {
  // Hàm tạo mới Workshop
  createWorkshop: async (payload) => {
    try {
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Bắt lỗi từ Backend trả về
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi không xác định từ Server");
      }

      // Trả về dữ liệu nếu thành công
      return await response.json(); 
    } catch (error) {
      console.error("API Error in createWorkshop:", error);
      throw error; // Ném lỗi ra cho UI xử lý (hiện alert)
    }
  },

  // Mốt bạn có thể viết thêm các hàm khác ở đây cực gọn:
  getAllWorkshops: async () => {
    try {
      const response = await fetch(BASE_URL);
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu từ Server");
      }
      return await response.json();
    } catch (error) {
      console.error("API Error in getAllWorkshops:", error);
      throw error;
    }
  },

  getWorkshopById: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`);
      if (!response.ok) {
        throw new Error("Không tìm thấy Workshop");
      }
      return await response.json();
    } catch (error) {
      console.error("API Error in getWorkshopById:", error);
      throw error;
    }
  },
};