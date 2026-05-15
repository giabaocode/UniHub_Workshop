package com.unihub.workshop.service;

import com.unihub.workshop.entity.User;
import com.unihub.workshop.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

@Service
public class CsvSyncJob {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public CsvSyncJob(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // TẠM THỜI: Chạy 15 giây 1 lần để test
    @Scheduled(cron = "*/15 * * * * *")
    public void syncStudentsFromCsv() {
        System.out.println("Bắt đầu đồng bộ dữ liệu sinh viên từ file CSV lúc 2:00 AM...");
        String csvFile = "students.csv";
        String line;
        String cvsSplitBy = ",";

        try (BufferedReader br = new BufferedReader(new FileReader(csvFile))) {
            // Bỏ qua dòng tiêu đề (header)
            br.readLine();

            int successCount = 0;
            int errorCount = 0;

            while ((line = br.readLine()) != null) {
                // Try-catch từng dòng để đảm bảo 1 dòng lỗi không làm hỏng toàn bộ file
                try {
                    String[] data = line.split(cvsSplitBy);
                    if (data.length < 5) continue;

                    String studentId = data[0].trim();
                    String fullName = data[1].trim();
                    String email = data[2].trim();
                    String faculty = data[3].trim();
                    String phoneNumber = data[4].trim();

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
}
