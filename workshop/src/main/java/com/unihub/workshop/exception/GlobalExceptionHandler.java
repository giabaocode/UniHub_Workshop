package com.unihub.workshop.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    // 1. Bắt lỗi tranh chấp ghế (Optimistic Locking)
    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<Map<String, String>> handleOptimisticLocking(ObjectOptimisticLockingFailureException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Vé cuối cùng đã có người nhanh tay hơn! Vui lòng thử lại.");
        response.put("status", "CONFLICT");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    // 2. Bắt lỗi RuntimeException chung (Ví dụ: "Hết vé", "User không tồn tại")
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        Map<String, String> response = new HashMap<>();
        // Định dạng trả về JSON thay vì chữ text thô để React dễ map vào popup
        response.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // 3. Bắt lỗi Exception không lường trước (Lỗi hệ thống 500)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneralException(Exception ex) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Lỗi máy chủ nội bộ. Vui lòng liên hệ Admin.");
        response.put("details", ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
