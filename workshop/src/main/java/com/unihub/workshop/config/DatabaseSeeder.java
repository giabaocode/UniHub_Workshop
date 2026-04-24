package com.unihub.workshop.config;

import com.unihub.workshop.entity.Workshop;
import com.unihub.workshop.repository.WorkshopRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final WorkshopRepository workshopRepository;

    public DatabaseSeeder(WorkshopRepository workshopRepository) {
        this.workshopRepository = workshopRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (workshopRepository.count() == 0) {
            Workshop workshop1 = new Workshop(
                    "Kỹ năng phỏng vấn xin việc cho sinh viên IT",
                    "Nguyễn Văn A",
                    LocalDate.of(2026, 5, 10),
                    LocalTime.of(8, 0),
                    "Hội trường lớn",
                    100,
                    0.0,
                    LocalDateTime.of(2026, 5, 9, 23, 59),
                    "Hướng dẫn sinh viên IT các kỹ năng trả lời phỏng vấn chuyên ngành, xử lý tình huống.",
                    "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80" // Ảnh buổi phỏng vấn
            );

            Workshop workshop2 = new Workshop(
                    "Định hướng nghề nghiệp Data Science",
                    "Trần Thị B",
                    LocalDate.of(2026, 5, 15),
                    LocalTime.of(13, 30),
                    "Phòng A102",
                    50,
                    50000.0,
                    LocalDateTime.of(2026, 5, 14, 23, 59),
                    "Chia sẻ lộ trình học tập và phát triển sự nghiệp trong lĩnh vực Data Science.",
                    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" // Ảnh Data/Code
            );

            Workshop workshop3 = new Workshop(
                    "Xây dựng thương hiệu cá nhân trên LinkedIn",
                    "Lê Văn C",
                    LocalDate.of(2026, 5, 20),
                    LocalTime.of(9, 0),
                    "Phòng B201",
                    80,
                    0.0,
                    LocalDateTime.of(2026, 5, 19, 23, 59),
                    "Cách tối ưu profile LinkedIn để thu hút nhà tuyển dụng và xây dựng mạng lưới quan hệ.",
                    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80" // Ảnh LinkedIn
            );

            workshopRepository.saveAll(Arrays.asList(workshop1, workshop2, workshop3));
            System.out.println("Đã chèn mock data thành công cho bảng Workshop!");
        }
    }
}