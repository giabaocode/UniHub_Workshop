package com.unihub.workshop.service;

import com.unihub.workshop.entity.Workshop;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class WorkshopSeatSseService {
    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter registerEmitter() {
        SseEmitter emitter = new SseEmitter(3600000L);
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError((e) -> emitters.remove(emitter));

        try {
            emitter.send(SseEmitter.event().name("INIT").data("Connected to Workshop Seat Stream"));
        } catch (IOException e) {
            emitters.remove(emitter);
        }

        return emitter;
    }

    public void sendSeatUpdate(Workshop workshop) {
        if (workshop == null || workshop.getId() == null) {
            return;
        }

        int totalSeats = workshop.getTotalSeats() != null ? workshop.getTotalSeats() : 0;
        int bookedSpots = workshop.getBookedSpots();
        int remainingSeats = Math.max(0, totalSeats - bookedSpots);
        String payload = String.format(
                "{\"workshopId\":%d,\"totalSeats\":%d,\"bookedSpots\":%d,\"remainingSeats\":%d}",
                workshop.getId(),
                totalSeats,
                bookedSpots,
                remainingSeats
        );

        sendEvent("SEAT_UPDATE", payload);
    }

    public void sendRefresh() {
        sendEvent("REFRESH_WORKSHOPS", "{\"reason\":\"seat-sync\"}");
    }

    private void sendEvent(String name, String payload) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name(name).data(payload));
            } catch (IOException e) {
                emitters.remove(emitter);
            }
        }
    }
}
