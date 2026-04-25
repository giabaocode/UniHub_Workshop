// URL gốc của Backend — lấy từ biến môi trường Vite
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/workshops`;
const TICKET_URL = `${import.meta.env.VITE_API_BASE_URL}/tickets`;

// HÀM QUAN TRỌNG: Lấy token từ localStorage để chứng minh bạn đã đăng nhập
const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  // Chú ý: Nếu Backend của bạn đặt tên biến là accessToken thì sửa user.token thành user.accessToken nhé
  if (user && user.token) { 
    return { Authorization: `Bearer ${user.token}` };
  }
  return {}; // Trả về rỗng nếu chưa đăng nhập
};

export const workshopService = {
  // Hàm tạo mới Workshop
  createWorkshop: async (payload) => {
    try {
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(), // <--- Ném thẻ ra vào vào đây
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi không xác định từ Server");
      }
      return await response.json(); 
    } catch (error) {
      console.error("API Error in createWorkshop:", error);
      throw error;
    }
  },

  getAllWorkshops: async () => {
    try {
      const response = await fetch(BASE_URL, {
        method: "GET",
        headers: {
            ...getAuthHeader(), // Kẹp vào cho chắc ăn
        }
      });
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
      // 1. CHỈ GỌI API ĐƠN GIẢN, KHÔNG GỬI TOKEN
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      
      // 2. BÁO LỖI RÕ RÀNG ĐỂ BẮT ĐÚNG BỆNH
      if (!response.ok) {
        if (response.status === 403) {
           throw new Error("Lỗi 403: Vẫn bị Spring Security chặn rồi!");
        }
        if (response.status === 404) {
           throw new Error(`Lỗi 404: Spring Boot thề là không tìm thấy ID ${id} trong Database! Hoặc bạn chưa viết API này.`);
        }
        throw new Error(`Lỗi ${response.status} từ Server`);
      }
      return await response.json();
    } catch (error) {
      console.error("API Error in getWorkshopById:", error);
      throw error;
    }
  },
  updateWorkshop: async (id, payload) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            ...getAuthHeader(), // <--- Ném thẻ ra vào vào đây
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi cập nhật Workshop");
      }
      return await response.json();
    } catch (error) {
      console.error("API Error in updateWorkshop:", error);
      throw error;
    }
  },

  // Hàm xóa (Delete)
  deleteWorkshop: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, { 
        method: "DELETE",
        headers: {
            ...getAuthHeader(), // <--- Ném thẻ ra vào vào đây
        }
      });
      if (!response.ok) {
        throw new Error("Không thể xóa workshop này (Có thể đã có người mua vé)");
      }
      return true;
    } catch (error) {
      console.error("API Error in deleteWorkshop:", error);
      throw error;
    }
  },

  getAttendeesByWorkshopId: async (workshopId) => {
    try {
      const response = await fetch(`${TICKET_URL}/workshop/${workshopId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(), // Phải có token của Admin
        }
      });
      if (!response.ok) throw new Error("Không thể tải danh sách người tham dự");
      return await response.json();
    } catch (error) {
      console.error("API Error in getAttendees:", error);
      throw error;
    }
  },

  // Check-in cho một vé
  checkInAttendee: async (ticketId) => {
    try {
      const response = await fetch(`${TICKET_URL}/${ticketId}/checkin`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        }
      });
      if (!response.ok) throw new Error("Lỗi khi Check-in");
      return await response.json();
    } catch (error) {
      console.error("API Error in checkIn:", error);
      throw error;
    }
  }
};