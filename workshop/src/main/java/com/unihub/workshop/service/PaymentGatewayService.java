package com.unihub.workshop.service;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class PaymentGatewayService {
    public static final String PAYMENT_GATEWAY_DOWN = "PAYMENT_GATEWAY_DOWN";

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.payment.sepay.account:0396660219}")
    private String sepayAccount;

    @Value("${app.payment.sepay.bank:MBBank}")
    private String sepayBank;

    @Value("${app.payment.sepay.enabled:true}")
    private boolean sepayEnabled;

    @CircuitBreaker(name = "sepay", fallbackMethod = "fallbackPaymentGateway")
    public String generatePaymentUrl(String ticketCode, Double price) {
        if (!sepayEnabled) {
            throw new IllegalStateException("Cổng thanh toán SePay đang bị tắt bằng cấu hình.");
        }

        String url = buildPaymentUrl(ticketCode, price);

        ResponseEntity<byte[]> response = restTemplate.getForEntity(url, byte[].class);
        if (response.getStatusCode().is2xxSuccessful()) {
            return url;
        }

        throw new RuntimeException("Cổng thanh toán trả về lỗi: " + response.getStatusCode());
    }

    public String buildPaymentUrl(String ticketCode, Double price) {
        return String.format("https://qr.sepay.vn/img?acc=%s&bank=%s&amount=%s&des=%s",
                sepayAccount, sepayBank, price.intValue(), ticketCode);
    }

    public String fallbackPaymentGateway(String ticketCode, Double price, Throwable t) {
        System.err.println("Cảnh báo: Cổng thanh toán SePay đang sập hoặc quá tải. Lỗi: " + t.getMessage());
        System.err.println("Kích hoạt Fallback: Giữ vé ở trạng thái PENDING để thanh toán lại sau.");
        return PAYMENT_GATEWAY_DOWN;
    }
}
