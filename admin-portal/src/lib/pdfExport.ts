import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportVoucherPDF = (voucher: any) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text("Peshawar Services Club", 105, 20, { align: "center" });
  doc.setFontSize(16);
  doc.text("Payment Voucher", 105, 30, { align: "center" });
  
  // Voucher details
  doc.setFontSize(12);
  doc.text(`Voucher No: ${voucher.voucherNo}`, 20, 50);
  doc.text(`Date: ${voucher.date}`, 20, 60);
  doc.text(`Member ID: ${voucher.memberId}`, 20, 70);
  doc.text(`Type: ${voucher.type}`, 20, 80);
  doc.text(`Amount: PKR ${voucher.amount.toLocaleString()}`, 20, 90);
  doc.text(`Status: ${voucher.status}`, 20, 100);
  
  // Footer
  doc.setFontSize(10);
  doc.text("Thank you for your payment", 105, 280, { align: "center" });
  
  doc.save(`voucher-${voucher.voucherNo}.pdf`);
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
