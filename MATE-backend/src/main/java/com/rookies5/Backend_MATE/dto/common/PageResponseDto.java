package com.rookies5.Backend_MATE.dto.common;

import lombok.Getter;
import org.springframework.data.domain.Page;
import java.util.List;

@Getter
public class PageResponseDto<T> {
    private List<T> content;
    private PageInfo page; // ✅ 프론트엔드가 찾는 "page" 객체

    public PageResponseDto(Page<T> pageData) {
        this.content = pageData.getContent();
        this.page = new PageInfo(pageData.getTotalPages(), pageData.getTotalElements(), pageData.getNumber(), pageData.getSize());
    }

    @Getter
    public static class PageInfo {
        private int totalPages;
        private long totalElements;
        private int currentPage;
        private int size;

        public PageInfo(int totalPages, long totalElements, int currentPage, int size) {
            this.totalPages = totalPages;
            this.totalElements = totalElements;
            this.currentPage = currentPage;
            this.size = size;
        }
    }
}
