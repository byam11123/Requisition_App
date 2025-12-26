package com.requisition.repository;

import com.requisition.entity.SyncLog;
import com.requisition.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SyncLogRepository extends JpaRepository<SyncLog, Long> {
    List<SyncLog> findBySyncedFalseAndUserOrderByCreatedAtAsc(User user);
}
