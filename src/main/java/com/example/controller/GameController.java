package com.example.controller;

import jakarta.servlet.http.HttpSession;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class GameController {

    @GetMapping("/game")
    public String game(Model model) {
        return "gameMove";
    }
    
    @PostMapping("/game/restart")
    public String restartGame(HttpSession session) {
        // ゲーム状態をリセット
        session.removeAttribute("gameState"); // 例
        return "redirect:/game"; // ゲームページに戻す
    }

    

}
