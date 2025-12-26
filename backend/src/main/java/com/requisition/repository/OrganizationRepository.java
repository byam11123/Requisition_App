package com.requisition.repository;

import com.requisition.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    Optional<Organization> findByContactEmail(String contactEmail);

    Optional<Organization> findByName(String name);
}
