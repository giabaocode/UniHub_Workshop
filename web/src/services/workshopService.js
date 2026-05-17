import { API_BASE_URL } from "../config/api";

const BASE_URL = `${API_BASE_URL}/workshops`;
const TICKET_URL = `${API_BASE_URL}/tickets`;

// Tích hợp sẵn thẻ Ngrok vào Header chung
const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const headers = { "ngrok-skip-browser-warning": "true" }; // Vượt tường Ngrok

  if (user && user.token) {
    headers["Authorization"] = `Bearer ${user.token}`;
  }
  return headers;
};

export const workshopService = {
  createWorkshop: async (payload) => {
    try {
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
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
          ...getAuthHeader(), // Đã kẹp sẵn thẻ Ngrok bên trong
        },
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

  createSeatUpdateStream: ({ onSeatUpdate, onRefresh, onError } = {}) => {
    const eventSource = new EventSource(`${BASE_URL}/seat-stream`);

    eventSource.addEventListener("SEAT_UPDATE", (event) => {
      try {
        onSeatUpdate?.(JSON.parse(event.data));
      } catch (error) {
        console.error("Invalid seat update event:", error);
      }
    });

    eventSource.addEventListener("REFRESH_WORKSHOPS", () => {
      onRefresh?.();
    });

    eventSource.onerror = (error) => {
      onError?.(error);
    };

    return eventSource;
  },

  getWorkshopById: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true", // API public nên phải ném tay vào
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Lỗi 403: Vẫn bị Spring Security chặn rồi!");
        }
        if (response.status === 404) {
          throw new Error(
            `Lỗi 404: Spring Boot thề là không tìm thấy ID ${id} trong Database! Hoặc bạn chưa viết API này.`,
          );
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
          ...getAuthHeader(),
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

  deleteWorkshop: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeader(),
        },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.message ||
            data.error ||
            "Không thể xóa workshop này (Có thể đã có người mua vé)",
        );
      }
      return true;
    } catch (error) {
      console.error("API Error in deleteWorkshop:", error);
      throw error;
    }
  },

  cancelWorkshop: async (id, reason) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ reason: reason || "" }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || data.error || "Không thể hủy workshop");
      }
      return await response.json();
    } catch (error) {
      console.error("API Error in cancelWorkshop:", error);
      throw error;
    }
  },

  getAttendeesByWorkshopId: async (workshopId) => {
    try {
      const response = await fetch(`${TICKET_URL}/workshop/${workshopId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });
      if (!response.ok)
        throw new Error("Không thể tải danh sách người tham dự");
      return await response.json();
    } catch (error) {
      console.error("API Error in getAttendees:", error);
      throw error;
    }
  },

  checkInAttendee: async (ticketId) => {
    try {
      const response = await fetch(`${TICKET_URL}/${ticketId}/checkin`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });
      if (!response.ok) {
        const text = await response.text();
        let errorMessage = "Lỗi khi Check-in";
        if (text) {
          try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            errorMessage = text;
          }
        }
        throw new Error(errorMessage);
      }
      return await response.json();
    } catch (error) {
      console.error("API Error in checkIn:", error);
      throw error;
    }
  },
};
