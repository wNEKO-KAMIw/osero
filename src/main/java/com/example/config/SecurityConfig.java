package com.example.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import com.example.service.CustomUserDetailsService;

@Configuration
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(CustomUserDetailsService uds) {
        this.userDetailsService = uds;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // URLごとのアクセス権限設定
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/h2-console/**", "/register", "/css/**").permitAll()
                .anyRequest().authenticated()
            )
            // ログイン設定
            .formLogin(login -> login.defaultSuccessUrl("/game", true))
            // ログアウト設定
            .logout(logout -> logout.logoutSuccessUrl("/login"))
            // CSRF 設定
            .csrf(csrf -> csrf
                // H2 コンソールのみ CSRF 無効化
                .ignoringRequestMatchers("/h2-console/**")
            )
            // H2 コンソール用に iframe 許可
            .headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }

    // パスワード暗号化用
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 認証プロバイダ設定
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }
}
