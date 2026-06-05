package com.rookies5.Backend_MATE;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing // BaseEntity에서 작성 시간이 자동으로 저장
@SpringBootApplication
public class BackendMateApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendMateApplication.class, args);
    }
}