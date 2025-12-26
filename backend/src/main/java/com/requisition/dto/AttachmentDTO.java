package com.requisition.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentDTO {
    private Long id;
    private String fileName;
    private String fileUrl;
    private String category;
    private LocalDateTime uploadedAt;
    private String uploadedByName;
}
