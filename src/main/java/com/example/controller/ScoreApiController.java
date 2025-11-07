package com.example.controller;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.entity.Score;
import com.example.repository.ScoreRepository;

@RestController
public class ScoreApiController {

    @Autowired
    private ScoreRepository scoreRepository;

    @PostMapping("/api/scores")
    public ResponseEntity<?> saveScore(@AuthenticationPrincipal UserDetails userDetails,
                                       @RequestBody Map<String, Integer> payload) {
        String username = (userDetails != null) ? userDetails.getUsername() : "guest";
        int score = payload.get("score");

        Score s = new Score();
        s.setUsername(username);
        s.setScore(score);
        s.setPlayedAt(LocalDateTime.now());

        scoreRepository.save(s);

        return ResponseEntity.ok().build();
    }
}
