package com.example.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.example.entity.Score;
import com.example.repository.ScoreRepository;

@Controller
public class RankingController {

    private final ScoreRepository scoreRepository;

    public RankingController(ScoreRepository scoreRepository) {
        this.scoreRepository = scoreRepository;
    }

    @GetMapping("/ranking")
    public String showRanking(Model model, Principal principal) {
    	
        List<Score> topScores = scoreRepository.findTop10ByOrderByScoreDesc();
        model.addAttribute("topScores", topScores);
        model.addAttribute("currentUser", principal.getName()); // ← ログインIDをそのまま渡す
        //System.out.println("Saving score for: " + principal.getName());
        return "ranking";
    }
}
