package com.requisition.config;

import com.requisition.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.time.LocalDateTime;

@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Object>> handleRuntimeException(RuntimeException ex) {
        String message = ex.getMessage();
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;

        if (message.contains("not found")) {
            status = HttpStatus.NOT_FOUND;
        } else if (message.contains("Invalid credentials") || message.contains("User already exists")) {
            status = HttpStatus.BAD_REQUEST; // or 401/409 depending on context
        }

        return new ResponseEntity<>(
                new ApiResponse<>(false, message, null, LocalDateTime.now()),
                status);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGlobalException(Exception ex) {
        return new ResponseEntity<>(
                new ApiResponse<>(false, "An unexpected error occurred: " + ex.getMessage(), null, LocalDateTime.now()),
                HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
