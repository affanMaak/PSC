import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportVoucherPDF = (voucher: any) => {
  const doc = new jsPDF();
  
  // Colors
  const primaryColor = [41, 128, 185] as [number, number, number]; // Professional blue
  const secondaryColor = [52, 73, 94] as [number, number, number]; // Dark gray
  const lightGray = [236, 240, 241] as [number, number, number];
  const successColor = [39, 174, 96] as [number, number, number];
  const warningColor = [243, 156, 18] as [number, number, number];
  const dangerColor = [231, 76, 60] as [number, number, number];
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Helper to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // ========== HEADER SECTION ==========
  // Blue header bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Organization name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text("PESHAWAR SERVICES CLUB", pageWidth / 2, 20, { align: "center" });
  
  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text("Peshawar Cantonment, Pakistan", pageWidth / 2, 28, { align: "center" });
  doc.text("Phone: +92-XXX-XXXXXXX | Email: info@peshawarsclub.pk", pageWidth / 2, 35, { align: "center" });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // ========== DOCUMENT TITLE ==========
  doc.setFillColor(...lightGray);
  doc.rect(15, 55, pageWidth - 30, 15, 'F');
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...secondaryColor);
  doc.text("PAYMENT VOUCHER", pageWidth / 2, 65, { align: "center" });
  
  // ========== VOUCHER INFO BAR ==========
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const voucherNo = voucher.voucher_no || voucher.id || 'N/A';
  const issuedDate = formatDate(voucher.issued_at);
  
  // Left side - Voucher number
  doc.setFont('helvetica', 'bold');
  doc.text("Voucher No:", 15, 82);
  doc.setFont('helvetica', 'normal');
  doc.text(voucherNo.toString(), 45, 82);
  
  // Right side - Date
  doc.setFont('helvetica', 'bold');
  doc.text("Issue Date:", pageWidth - 65, 82);
  doc.setFont('helvetica', 'normal');
  doc.text(issuedDate, pageWidth - 35, 82);
  
  // Divider line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(15, 88, pageWidth - 15, 88);
  
  // ========== MEMBER/PAYER INFORMATION ==========
  let yPos = 100;
  
  doc.setFillColor(...lightGray);
  doc.rect(15, yPos, pageWidth - 30, 8, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...secondaryColor);
  doc.text("PAYER INFORMATION", 20, yPos + 6);
  
  yPos += 15;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  // Two-column layout for member info
  const leftCol = 20;
  const rightCol = 110;
  
  // Left column
  doc.setFont('helvetica', 'bold');
  doc.text("Member Name:", leftCol, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(voucher.memberName || voucher.member?.Name || 'N/A', leftCol + 30, yPos);
  
  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.text("Membership No:", leftCol, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(voucher.membershipNo || voucher.membership_no || voucher.member?.Membership_No || 'N/A', leftCol + 30, yPos);
  
  // Right column (reset yPos for right column)
  yPos -= 8;
  doc.setFont('helvetica', 'bold');
  doc.text("Contact:", rightCol, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(voucher.member?.Contact_No || 'N/A', rightCol + 20, yPos);
  
  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.text("Email:", rightCol, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(voucher.member?.Email || 'N/A', rightCol + 20, yPos);
  
  yPos += 15;
  
  // ========== PAYMENT DETAILS ==========
  doc.setFillColor(...lightGray);
  doc.rect(15, yPos, pageWidth - 30, 8, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...secondaryColor);
  doc.text("PAYMENT DETAILS", 20, yPos + 6);
  
  yPos += 15;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  // Booking type
  doc.setFont('helvetica', 'bold');
  doc.text("Booking Type:", leftCol, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(voucher.booking_type || 'N/A', leftCol + 30, yPos);
  
  // Right column - Voucher type
  doc.setFont('helvetica', 'bold');
  doc.text("Voucher Type:", rightCol, yPos);
  doc.setFont('helvetica', 'normal');
  const voucherTypeText = voucher.voucher_type || 'N/A';
  doc.text(voucherTypeText.replace(/_/g, ' '), rightCol + 28, yPos);
  
  yPos += 8;
  
  // Payment method
  doc.setFont('helvetica', 'bold');
  doc.text("Payment Mode:", leftCol, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(voucher.payment_mode || 'N/A', leftCol + 30, yPos);
  
  // Right column - Booking ID
  if (voucher.booking_id) {
    doc.setFont('helvetica', 'bold');
    doc.text("Booking ID:", rightCol, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(voucher.booking_id.toString(), rightCol + 28, yPos);
    yPos += 8;
  }
  
  // Remarks (if available)
  if (voucher.remarks) {
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text("Remarks:", leftCol, yPos);
    doc.setFont('helvetica', 'normal');
    const remarks = voucher.remarks || '';
    // Split remarks if too long
    const maxWidth = 150;
    const remarksLines = doc.splitTextToSize(remarks, maxWidth);
    doc.text(remarksLines, leftCol + 20, yPos);
    yPos += (remarksLines.length * 5);
  }
  
  // Transaction ID for online payments
  if (voucher.transaction_id && voucher.payment_mode === 'ONLINE') {
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text("Transaction ID:", leftCol, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(voucher.transaction_id, leftCol + 30, yPos);
  }
  
  yPos += 10;
  
  // ========== AMOUNT BREAKDOWN TABLE ==========
  const tableData: any[][] = [];
  const amount = Number(voucher.amount) || 0;
  
  // Add the main amount row
  tableData.push(['Payment Amount', `PKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]);
  
  // Total is just the amount (no tax or discount in schema)
  const total = amount;
  
  autoTable(doc, {
    startY: yPos,
    head: [['Description', 'Amount']],
    body: tableData,
    foot: [['Total Amount', `PKR ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]],
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 11
    },
    footStyles: {
      fillColor: secondaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 12
    },
    columnStyles: {
      0: { cellWidth: 130 },
      1: { cellWidth: 45, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 15, right: 15 }
  });
  
  // Get final Y position after table
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // ========== STATUS SECTION ==========
  doc.setFillColor(...lightGray);
  doc.rect(15, yPos, pageWidth - 30, 8, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...secondaryColor);
  doc.text("PAYMENT STATUS", 20, yPos + 6);
  
  yPos += 15;
  
  // Status badge
  const status = voucher.status || 'PENDING';
  let statusColor = warningColor;
  let statusText = 'PENDING';
  
  // VoucherStatus enum: PENDING, CONFIRMED, CANCELLED
  if (status === 'CONFIRMED') {
    statusColor = successColor;
    statusText = 'CONFIRMED';
  } else if (status === 'CANCELLED') {
    statusColor = dangerColor;
    statusText = 'CANCELLED';
  } else if (status === 'PENDING') {
    statusColor = warningColor;
    statusText = 'PENDING';
  }
  
  doc.setFillColor(...statusColor);
  doc.roundedRect(leftCol, yPos - 5, 60, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(statusText, leftCol + 30, yPos + 1, { align: 'center' });
  
  // Show issued by
  if (voucher.issued_by) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Issued by: ${voucher.issued_by}`, leftCol + 70, yPos + 1);
  }
  
  yPos += 15;
  
  // ========== NOTES SECTION ==========
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text("Note: This is a computer-generated voucher and does not require a signature.", 20, yPos);
  yPos += 5;
  doc.text("Please keep this voucher for your records. For queries, contact the accounts department.", 20, yPos);
  
  // ========== FOOTER ==========
  const footerY = pageHeight - 25;
  
  // Footer divider
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);
  
  // Footer text
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text("Peshawar Services Club", pageWidth / 2, footerY, { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleString('en-US')}`, pageWidth / 2, footerY + 5, { align: 'center' });
  
  // Watermark (if pending or cancelled)
  if (status === 'PENDING' || status === 'CANCELLED') {
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    const watermarkText = status === 'CANCELLED' ? 'CANCELLED' : 'PENDING';
    doc.text(watermarkText, pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45
    });
  }
  
  // Save the PDF
  doc.save(`voucher-${voucherNo}-${Date.now()}.pdf`);
};

export const exportRoomTypesReport = (roomTypes: any[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text("Room Types Report", 105, 20, { align: "center" });
  console.log(roomTypes)
  autoTable(doc, {
    startY: 30,
    head: [["Type", "Member Price (PKR/Day)", "Guest Price (PKR/Day)"]],
    body: roomTypes.map(rt => [
      rt.type,
      rt.priceMember,
      rt.priceGuest
    ]),
  });
  
  doc.save("room-types-report.pdf");
};

export const exportHallsReport = (halls: any[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text("Halls Report", 105, 20, { align: "center" });
  
  autoTable(doc, {
    startY: 30,
    head: [["Hall Name", "Capacity", "Member Charges (PKR)", "Guest Charges (PKR)", "Status"]],
    body: halls.map(hall => [
      hall.name,
      hall.capacity,
      hall.chargesMembers.toLocaleString(),
      hall.chargesGuests.toLocaleString(),
      hall.isActive ? "Active" : "Inactive"
    ]),
  });
  
  doc.save("halls-report.pdf");
};

export const exportLawnsReport = (lawns: any[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text("Lawns Report", 105, 20, { align: "center" });
  
  autoTable(doc, {
    startY: 30,
    head: [["Category", "Capacity Range", "Member Charges (PKR)", "Guest Charges (PKR)"]],
    body: lawns.map(lawn => [
      lawn.lawnCategory,
      `${lawn.minGuests} - ${lawn.maxGuests}`,
      lawn.memberCharges.toLocaleString(),
      lawn.guestCharges.toLocaleString()
    ]),
  });
  
  doc.save("lawns-report.pdf");
};

export const exportPhotoshootReport = (photoshoot: any[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text("Photoshoot Services Report", 105, 20, { align: "center" });
  
  autoTable(doc, {
    startY: 30,
    head: [["Description", "Member Charges (PKR/Hour)", "Guest Charges (PKR/Hour)"]],
    body: photoshoot.map(ps => [
      ps.description,
      ps.memberChargesPerHour.toLocaleString(),
      ps.guestChargesPerHour.toLocaleString()
    ]),
  });
  
  doc.save("photoshoot-report.pdf");
};
