package com.bestvet.bestvet.config;

import com.bestvet.bestvet.user.Role;
import com.bestvet.bestvet.user.UserAccount;
import com.bestvet.bestvet.user.UserAccountRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap implements ApplicationRunner {
    private final UserAccountRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final String username;
    private final String password;

    public AdminBootstrap(UserAccountRepository repository,
                          PasswordEncoder passwordEncoder,
                          @Value("${app.admin.username}") String username,
                          @Value("${app.admin.password}") String password) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.username = username;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!repository.existsByUsername(username)) {
            repository.save(new UserAccount(username, passwordEncoder.encode(password), Role.ADMIN));
        }
    }
}
