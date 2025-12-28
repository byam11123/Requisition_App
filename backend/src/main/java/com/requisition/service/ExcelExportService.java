package com.requisition.service;

import com.requisition.entity.Requisition;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.util.IOUtils;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExcelExportService {

    private final FileStorageService fileStorageService;

    public ByteArrayInputStream exportRequisitions(List<Requisition> requisitions) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Requisitions");

            // --- Styles ---
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            CellStyle titleStyle = workbook.createCellStyle();
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);
            titleStyle.setFont(titleFont);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);

            CellStyle dateStyle = workbook.createCellStyle();
            dateStyle.setDataFormat(workbook.createDataFormat().getFormat("dd/MM/yyyy HH:mm"));
            dateStyle.setBorderBottom(BorderStyle.THIN);
            dateStyle.setBorderTop(BorderStyle.THIN);
            dateStyle.setBorderLeft(BorderStyle.THIN);
            dateStyle.setBorderRight(BorderStyle.THIN);

            CellStyle cellStyle = workbook.createCellStyle();
            cellStyle.setBorderBottom(BorderStyle.THIN);
            cellStyle.setBorderTop(BorderStyle.THIN);
            cellStyle.setBorderLeft(BorderStyle.THIN);
            cellStyle.setBorderRight(BorderStyle.THIN);

            // --- Header Section ---
            // Row 0: Logo (if available) + Report Details
            // We will reserve rows 0-3 for the header

            // Get Organization details from first requisition if available
            String companyName = "COMPANY NAME";
            String logoUrl = null;
            if (!requisitions.isEmpty()) {
                companyName = requisitions.get(0).getOrganization().getName();
                logoUrl = requisitions.get(0).getOrganization().getLogoUrl();
            }

            // Insert Logo
            if (logoUrl != null && !logoUrl.isEmpty()) {
                try {
                    Path logoPath = fileStorageService.loadFile(logoUrl);
                    try (InputStream is = new FileInputStream(logoPath.toFile())) {
                        byte[] bytes = IOUtils.toByteArray(is);
                        int pictureIdx = workbook.addPicture(bytes, Workbook.PICTURE_TYPE_PNG); // Assuming PNG/JPG, POI
                                                                                                // handles mostly
                        // Determine type based on extension?
                        // Simplified: try generic auto-detection or just add as PNG/JPEG
                        // Re-check extension
                        if (logoUrl.toLowerCase().endsWith(".jpg") || logoUrl.toLowerCase().endsWith(".jpeg")) {
                            pictureIdx = workbook.addPicture(bytes, Workbook.PICTURE_TYPE_JPEG);
                        }

                        CreationHelper helper = workbook.getCreationHelper();
                        Drawing<?> drawing = sheet.createDrawingPatriarch();
                        ClientAnchor anchor = helper.createClientAnchor();

                        // Position image in top-left cell (0,0) to spanning maybe 2x3?
                        anchor.setCol1(0);
                        anchor.setRow1(0);
                        anchor.setCol2(2); // End column
                        anchor.setRow2(4); // End row

                        Picture pict = drawing.createPicture(anchor, pictureIdx);
                        // pict.resize(); // Don't auto resize if we want it in fixed box
                    }
                } catch (Exception e) {
                    System.err.println("Failed to load logo for excel: " + e.getMessage());
                }
            }

            // Row 0: Report Name
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(2); // Start after potential logo space
            titleCell.setCellValue("REQUISITION REPORT");
            titleCell.setCellStyle(titleStyle);

            // Row 1: Company Name
            Row companyRow = sheet.createRow(1);
            Cell companyCell = companyRow.createCell(2);
            companyCell.setCellValue(companyName);
            companyCell.setCellStyle(titleStyle); // Reuse big font or make slightly smaller

            // Row 2: Date Range / Generated Date
            Row dateRow = sheet.createRow(2);
            Cell dateCell = dateRow.createCell(2);
            dateCell.setCellValue("Report Generated: "
                    + java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));

            // --- Table Header ---
            String[] columns = {
                    "Request ID", "Timestamp", "Requisition By", "Site", "Description",
                    "Quantity", "Amount", "PO Details", "Required For", "Vendor",
                    "Indent No", "Status", "Payment Status", "Priority",
                    "Payment Mode", "Payment Details", "Approve Status"
            };

            Row headerRow = sheet.createRow(4);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // --- Data Rows ---
            int rowIdx = 5;
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

            for (Requisition req : requisitions) {
                Row row = sheet.createRow(rowIdx++);

                createCell(row, 0, req.getRequestId(), cellStyle);
                createCell(row, 1, req.getCreatedAt() != null ? req.getCreatedAt().format(dtf) : "", cellStyle);
                createCell(row, 2, req.getCreatedBy() != null ? req.getCreatedBy().getFullName() : "N/A", cellStyle);
                createCell(row, 3, req.getSiteAddress(), cellStyle);
                createCell(row, 4,
                        req.getDescription()
                                + (req.getMaterialDescription() != null ? " - " + req.getMaterialDescription() : ""),
                        cellStyle);
                createCell(row, 5, req.getQuantity() != null ? req.getQuantity().toString() : "0", cellStyle);
                createCell(row, 6, req.getAmount() != null ? req.getAmount().toString() : "0.00", cellStyle);
                createCell(row, 7, req.getPoDetails(), cellStyle);
                createCell(row, 8, req.getRequiredFor(), cellStyle);
                createCell(row, 9, req.getVendorName(), cellStyle);
                createCell(row, 10, req.getIndentNo(), cellStyle);
                createCell(row, 11, req.getStatus().toString(), cellStyle);
                createCell(row, 12, req.getPaymentStatus().toString(), cellStyle);
                createCell(row, 13, req.getPriority().toString(), cellStyle);
                createCell(row, 14, req.getModeOfPayment() != null ? req.getModeOfPayment().toString() : "", cellStyle);
                createCell(row, 15, req.getPaymentUtrNo(), cellStyle);
                createCell(row, 16, req.getApprovalStatus().toString(), cellStyle);
            }

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    private void createCell(Row row, int column, String value, CellStyle style) {
        Cell cell = row.createCell(column);
        cell.setCellValue(value != null ? value : "");
        cell.setCellStyle(style);
    }
}
