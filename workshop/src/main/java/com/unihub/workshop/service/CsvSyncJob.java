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
import java.util.regex.Pattern;

@Service
public class CsvSyncJob {
    private static final int EXPECTED_COLUMNS = 5;
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@,]+@[^\\s@,]+\\.[^\\s@,]+$");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public CsvSyncJob(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Đồng bộ CSV định kỳ, mặc định mỗi 10 giây cho môi trường workshop/demo.
    @Scheduled(
            initialDelayString = "${app.csv-sync.initial-delay-ms:10000}",
            fixedDelayString = "${app.csv-sync.fixed-delay-ms:10000}"
    )
    public void syncStudentsFromCsv() {
        System.out.println("Bắt đầu đồng bộ dữ liệu sinh viên từ file CSV...");
        String csvFile = "students.csv";
        String line;

        try (BufferedReader br = new BufferedReader(new FileReader(csvFile))) {
            // Bỏ qua dòng tiêu đề (header)
            br.readLine();

            int successCount = 0;
            int errorCount = 0;
            int lineNumber = 1;

            while ((line = br.readLine()) != null) {
                lineNumber++;
                // Try-catch từng dòng để đảm bảo 1 dòng lỗi không làm hỏng toàn bộ file
                try {
                    List<String> data = parseCsvLine(line);
                    validateStudentRow(data);

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
                    System.out.println("[CSV][OK] Dòng " + lineNumber + ": " + studentId + " - " + email);
                } catch (Exception e) {
                    System.err.println("[CSV][FAIL] Dòng " + lineNumber + ": " + e.getMessage() + " | raw=\"" + line + "\"");
                    errorCount++;
                }
            }
            System.out.println("Đồng bộ hoàn tất! Thành công: " + successCount + ", Lỗi: " + errorCount);

        } catch (IOException e) {
            System.err.println("Không thể đọc file students.csv (Có thể file chưa được đặt ở thư mục gốc của project): " + e.getMessage());
        }
    }

    static void validateStudentRow(List<String> data) {
        if (data.size() != EXPECTED_COLUMNS) {
            String hint = data.size() > EXPECTED_COLUMNS
                    ? " Có thể dòng có dấu phẩy thừa trong một field, ví dụ email bị tách thành nhiều cột."
                    : " Dòng đang thiếu cột.";
            throw new IllegalArgumentException("Sai số cột (" + data.size() + "/" + EXPECTED_COLUMNS + ")." + hint);
        }

        String studentId = data.get(0).trim();
        String fullName = data.get(1).trim();
        String email = data.get(2).trim();
        String faculty = data.get(3).trim();
        String phoneNumber = data.get(4).trim();

        if (studentId.isEmpty()) {
            throw new IllegalArgumentException("student_id rỗng. Có thể dòng bị thừa dấu phẩy ở đầu.");
        }
        if (fullName.isEmpty()) {
            throw new IllegalArgumentException("full_name rỗng.");
        }
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("email không hợp lệ: " + email);
        }
        if (faculty.isEmpty()) {
            throw new IllegalArgumentException("faculty rỗng.");
        }
        if (phoneNumber.isEmpty()) {
            throw new IllegalArgumentException("phone_number rỗng.");
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
