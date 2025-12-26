package com.requisition.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private Long draftCount;
    private Long pendingCount;
    private Long approvedCount;
    private Long paidCount;
    private Long rejectedCount;
    private Long totalCount;
    private Long dispatchedCount;
}
