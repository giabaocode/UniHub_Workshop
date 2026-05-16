package com.unihub.workshop.service;

import com.unihub.workshop.entity.User;
import com.unihub.workshop.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class CsvSyncJob {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public CsvSyncJob(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Chạy vào 2:00 AM mỗi ngày thay vì 15 giây 1 lần để tránh sập connection pool khi test
    @Scheduled(cron = "0 0 2 * * *")
    public void syncStudentsFromCsv() {
        System.out.println("Bắt đầu đồng bộ dữ liệu sinh viên từ file CSV lúc 2:00 AM...");
        String csvFile = "students.csv";
        String line;

        try (BufferedReader br = new BufferedReader(new FileReader(csvFile))) {
            // Bỏ qua dòng tiêu đề (header)
            br.readLine();

            int successCount = 0;
            int errorCount = 0;

            while ((line = br.readLine()) != null) {
                // Try-catch từng dòng để đảm bảo 1 dòng lỗi không làm hỏng toàn bộ file
                try {
                    List<String> data = parseCsvLine(line);
                    if (data.size() < 5) {
                        errorCount++;
                        System.err.println("Bỏ qua dòng CSV thiếu cột (" + data.size() + "/5): " + line);
                        continue;
                    }

                    String studentId = data.get(0).trim();
                    String fullName = data.get(1).trim();
                    String email = data.get(2).trim();
                    String faculty = data.get(3).trim();
                    String phoneNumber = data.get(4).trim();

                    // Tìm sinh viên đã tồn tại theo Email hoặc Student ID
                    User user = userRepository.findByEmail(email).orElseGet(() -> 
                                userRepository.findByStudentId(studentId).orElse(new User())
                    );

                    // Cập nhật (Upsert) dữ liệu
                    user.setStudentId(studentId);
                    user.setFullName(fullName);
                    user.setEmail(email);
                    user.setFaculty(faculty);
                    user.setPhoneNumber(phoneNumber);
                    
                    // Luôn gán quyền USER cho danh sách từ CSV
                    user.setRole("USER");

                    // Nếu là tài khoản mới, tạo mật khẩu mặc định
                    if (user.getId() == null) {
                        user.setPassword(passwordEncoder.encode("123456")); 
                    }

                    userRepository.save(user);
                    successCount++;
                } catch (Exception e) {
                    System.err.println("Lỗi khi đồng bộ dòng: " + line + " - Chi tiết: " + e.getMessage());
                    errorCount++;
                }
            }
            System.out.println("Đồng bộ hoàn tất! Thành công: " + successCount + ", Lỗi: " + errorCount);

        } catch (IOException e) {
            System.err.println("Không thể đọc file students.csv (Có thể file chưa được đặt ở thư mục gốc của project): " + e.getMessage());
        }
    }

    static List<String> parseCsvLine(String line) {
        List<String> fields = new ArrayList<>();
        StringBuilder field = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char current = line.charAt(i);

            if (current == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    field.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (current == ',' && !inQuotes) {
                fields.add(field.toString());
                field.setLength(0);
            } else {
                field.append(current);
            }
        }

        if (inQuotes) {
            throw new IllegalArgumentException("CSV field đang mở quote nhưng chưa đóng");
        }

        fields.add(field.toString());
        return fields;
    }
}
