package com.requisition.repository;

import com.requisition.entity.RequisitionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RequisitionTypeRepository extends JpaRepository<RequisitionType, Long> {
    Optional<RequisitionType> findByName(String name);
}
