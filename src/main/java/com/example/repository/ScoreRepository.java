package com.example.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.entity.Score;

public interface ScoreRepository extends JpaRepository<Score, Long> {
    List<Score> findTop10ByOrderByScoreDesc();
    List<Score> findByUsername(String username);
    Score findFirstByUsernameOrderByPlayedAtDesc(String username);
}
