package com.rookies5.Backend_MATE.service;

import com.rookies5.Backend_MATE.dto.request.BoardPostRequestDto;
import com.rookies5.Backend_MATE.dto.response.BoardPostResponseDto;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface BoardPostService {

    /**
     * 새로운 게시글 작성
     * @param userId 작성자 ID (추가됨)
     * @param requestDto 게시글 작성 정보
     * @return 생성된 게시글 상세 정보
     */
    BoardPostResponseDto createPost(Long userId, BoardPostRequestDto requestDto);

    /**
     * 특정 프로젝트에 속한 게시글 페이징 조회
     * @param projectId 프로젝트 ID
     * @param userId 요청한 사용자 ID (isAuthor 판별용)
     * @param pageable 페이징 정보
     * @return 해당 프로젝트의 게시글 페이징 결과
     */
    Page<BoardPostResponseDto> getPostsByProjectId(Long projectId, Long userId, Pageable pageable);

    /**
     * 게시글 부분 수정 (PATCH) - 기존 updatePost를 대체하거나 함께 사용
     */
    BoardPostResponseDto patchPost(Long postId, Long userId, BoardPostRequestDto requestDto);

    /**
     * 게시글 삭제
     * @param postId 삭제할 게시글 ID
     * @param userId 삭제 요청자 ID (권한 검증용으로 추가 권장)
     */
    void deletePost(Long postId, Long userId);

    /**
     * 게시글 상세 조회
     */
    BoardPostResponseDto getPostDetail(Long projectId, Long postId, Long userId);

}