package com.rookies5.Backend_MATE.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 프론트가 /uploads/** 로 요청하면 -> 내 컴퓨터의 mate_uploads 폴더를 뒤져라!
        registry.addResourceHandler("/uploads/**")

                .addResourceLocations("file:///" + System.getProperty("user.home") + "/mate_uploads/");
    }
}