const fs = require('fs');
const path = require('path');

const filesToBundle = [
    // Backend - New
    "workshop/src/main/java/com/unihub/workshop/config/RateLimitInterceptor.java",
    "workshop/src/main/java/com/unihub/workshop/config/WebMvcConfig.java",
    "workshop/src/main/java/com/unihub/workshop/controller/NotificationController.java",
    "workshop/src/main/java/com/unihub/workshop/event/TicketCreatedEvent.java",
    "workshop/src/main/java/com/unihub/workshop/exception/GlobalExceptionHandler.java",
    "workshop/src/main/java/com/unihub/workshop/service/CsvSyncJob.java",
    "workshop/src/main/java/com/unihub/workshop/service/EmailNotificationListener.java",
    // Backend - Modified
    "workshop/pom.xml",
    "workshop/src/main/resources/application.properties",
    "workshop/src/main/java/com/unihub/workshop/WorkshopApplication.java",
    "workshop/src/main/java/com/unihub/workshop/config/SecurityConfig.java",
    "workshop/src/main/java/com/unihub/workshop/config/JwtAuthenticationFilter.java",
    "workshop/src/main/java/com/unihub/workshop/controller/AuthController.java",
    "workshop/src/main/java/com/unihub/workshop/controller/SePayWebhookController.java",
    "workshop/src/main/java/com/unihub/workshop/controller/TicketController.java",
    "workshop/src/main/java/com/unihub/workshop/controller/UserController.java",
    "workshop/src/main/java/com/unihub/workshop/entity/Ticket.java",
    "workshop/src/main/java/com/unihub/workshop/entity/Workshop.java",
    "workshop/src/main/java/com/unihub/workshop/repository/UserRepository.java",
    "workshop/src/main/java/com/unihub/workshop/service/AuthService.java",
    "workshop/src/main/java/com/unihub/workshop/service/TicketService.java",
    "workshop/src/main/java/com/unihub/workshop/service/WorkshopService.java",
    
    // Frontend
    "web/src/pages/CheckInPage.jsx",
    "web/.env.example",
    "web/package.json",
    "web/vite.config.js",
    "web/src/App.jsx",
    "web/src/components/AdminLayout.jsx",
    "web/src/components/CheckoutModal.jsx",
    "web/src/components/Header.jsx",
    "web/src/pages/AdminCreateWorkshop.jsx",
    "web/src/pages/AdminStaffManagement.jsx",
    "web/src/pages/AdminWorkshopAttendees.jsx",
    "web/src/pages/AuthPage.jsx",
    "web/src/pages/WorkshopDetail.jsx",
    "web/src/services/auth.service.js",
    "web/src/services/user.service.js",
    "web/src/services/workshopService.js"
];

let outContent = "Dưới đây là các file mã nguồn mới nhất sau khi cập nhật rate_limiting và các tính năng:\n\n";

for (const filePath of filesToBundle) {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        outContent += `\n=======================================================\n`;
        outContent += `File: ${filePath}\n`;
        outContent += `=======================================================\n\n`;
        outContent += content;
        outContent += `\n`;
    } else {
        console.warn(`File not found: ${filePath}`);
    }
}

fs.writeFileSync('gemini_updates.txt', outContent, 'utf8');
console.log('Đã tạo thành công file gemini_updates.txt!');
