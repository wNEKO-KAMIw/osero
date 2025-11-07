package com.example.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.entity.Score;
import com.example.repository.ScoreRepository;

@Service
public class ScoreService {

    private final ScoreRepository scoreRepository;

    public ScoreService(ScoreRepository scoreRepository) {
        this.scoreRepository = scoreRepository;
    }

    public void saveScore(String username, int score) {
        Score s = new Score(username, score);
        scoreRepository.save(s);
    }

    public List<Score> getTopScores() {
        return scoreRepository.findTop10ByOrderByScoreDesc();
    }
}
