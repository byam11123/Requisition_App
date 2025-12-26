package com.requisition.service;

import com.requisition.dto.CreateRequisitionRequest;
import com.requisition.dto.RequisitionDTO;
import com.requisition.entity.Requisition;
import com.requisition.entity.RequisitionType;
import com.requisition.entity.User;
import com.requisition.repository.ApprovalRepository;
import com.requisition.repository.RequisitionRepository;
import com.requisition.repository.RequisitionTypeRepository;
import com.requisition.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.Optional;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RequisitionServiceTest {

    @Mock
    private RequisitionRepository requisitionRepository;

    @Mock
    private RequisitionTypeRepository typeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ApprovalRepository approvalRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private RequisitionService requisitionService;

    private User user;
    private RequisitionType type;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setRole(User.UserRole.PURCHASER);

        type = new RequisitionType();
        type.setId(1L);
        type.setName("Purchase");
    }

    @Test
    void createRequisition_Success() {
        // Arrange
        CreateRequisitionRequest request = new CreateRequisitionRequest();
        request.setRequisitionTypeId(1L);
        request.setDescription("Test Req");
        request.setAmount(BigDecimal.valueOf(100.0));
        request.setPriority("NORMAL");
        request.setQuantity(1);
        request.setSiteAddress("Test Site");
        request.setMaterialDescription("Test Material");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(typeRepository.findById(1L)).thenReturn(Optional.of(type));
        when(requisitionRepository.save(any(Requisition.class))).thenAnswer(invocation -> {
            Requisition r = invocation.getArgument(0);
            r.setId(100L); // Simulate DB ID generation
            r.setCreatedAt(LocalDateTime.now());
            r.setUpdatedAt(LocalDateTime.now());
            return r;
        });

        // Act
        RequisitionDTO result = requisitionService.createRequisition(1L, request);

        // Assert
        assertNotNull(result);
        assertEquals("Test Req", result.getDescription());
        assertEquals(BigDecimal.valueOf(100.0), result.getAmount());
        assertEquals("DRAFT", result.getStatus());

        verify(requisitionRepository, times(1)).save(any(Requisition.class));
        verify(messagingTemplate, times(1)).convertAndSend(anyString(), any(RequisitionDTO.class));
    }
}
