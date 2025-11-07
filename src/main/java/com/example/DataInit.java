package com.example;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.model.User;
import com.example.repository.UserRepository;

@Configuration
public class DataInit {

    @Bean
    CommandLineRunner init(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            userRepository.findByUsername("alice").orElseGet(() -> {
                User alice = new User();
                alice.setUsername("alice");
                alice.setPassword(passwordEncoder.encode("pass"));
                alice.setRole("USER");
                return userRepository.save(alice);
            });

            userRepository.findByUsername("bob").orElseGet(() -> {
                User bob = new User();
                bob.setUsername("bob");
                bob.setPassword(passwordEncoder.encode("word"));
                bob.setRole("USER");
                return userRepository.save(bob);
            });
            
            userRepository.findByUsername("tarou").orElseGet(() -> {
                User tarou = new User();
                tarou.setUsername("tarou");
                tarou.setPassword(passwordEncoder.encode("password"));
                tarou.setRole("USER");
                return userRepository.save(tarou);
            });

            System.out.println("初期ユーザー登録完了");
        };
    }
}
