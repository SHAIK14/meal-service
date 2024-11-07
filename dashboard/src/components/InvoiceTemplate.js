import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react"; // Import QRCodeSVG component
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas"; // Import for HTML to image conversion
import "../styles/InvoiceTemplate.css";

const InvoiceTemplate = () => {
  const [customerName] = useState("Mohammed");
  const [fromName] = useState("Zafran Valley");
  const [billingAddress] = useState("Rawabi Riyadh KSA");
  const [restaurantPhone] = useState("+966 597336794");
  const [vatNumber] = useState("123456789012345");
  const [customerPhone] = useState("+966 597336794");

  const qrCodeValue = "https://www.zafran-valley.com";

  const items = [
    {
      id: 1,
      description: "Afghani Lamb Butter Masala with Biryani Rice",
      duration: "5 Days",
      startDate: "2024-10-20", // Add start date
      endDate: "2024-10-25",
      vat: 15,
      amount: 109,
    },
    {
      id: 2,
      description: "High Protein",
      startDate: "2024-10-01", // Add start date
      endDate: "2024-10-24",
      duration: "24 Days",
      vat: 15,
      amount: 500,
    },
  ];

  const totalExcludingVat = items.reduce((acc, item) => acc + item.amount, 0);
  const totalVat = items.reduce(
    (acc, item) => acc + (item.amount * item.vat) / 100,
    0
  );
  const grandTotal = totalExcludingVat + totalVat;

  const downloadInvoice = () => {
    const input = document.getElementById("invoice"); // Get the invoice container
    const downloadButton = document.querySelector(".download-button"); // Get the download button

    // Hide the download button
    downloadButton.style.display = "none";

    // Use html2canvas to capture the content
    html2canvas(input).then((canvas) => {
      const pdf = new jsPDF("portrait", "pt", "a4");
      const imgData = canvas.toDataURL("image/png");

      // Calculate the A4 page size in pixels
      const imgWidth = 595.28; // A4 width in pt
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Scale height to keep aspect ratio

      // Add image to PDF and save
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("invoice.pdf");

      // Restore the download button
      downloadButton.style.display = "block"; // Show the button again
    });
  };

  return (
    <div className="invoice-container" id="invoice">
      {" "}
      {/* Add id to capture this element */}
      <h1>Invoice</h1>
      <div className="invoice-header">
        <div className="details-wrapper">
          <div className="address from">
            <h3>From:</h3>
            <p>
              <b>{fromName}</b>
            </p>
            <p>{billingAddress}</p>
            <p>
              <b>{restaurantPhone}</b>
            </p>
            <p> VAT No: {vatNumber}</p>
          </div>
          <div className="address to">
            <h3>Billing To:</h3>
            <p>
              <b>{customerName}</b>
            </p>
            <p>{billingAddress}</p>
            <p>
              <b>{customerPhone}</b>
            </p>
          </div>
        </div>
        <div className="Qr-contianer">
          <QRCodeSVG value={qrCodeValue} size={140} /> {/* Generate QR code */}
        </div>
      </div>
      <table className="table">
        <thead className="table-head">
          <tr>
            <th>S.No</th>
            <th>Plan Description</th>
            <th>Duration</th>
            <th>Start Date</th> {/* New Column */}
            <th>End Date</th> {/* New Column */}
            <th>VAT (SAR)</th>
            <th>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const vatAmount = (item.amount * item.vat) / 100; // Calculate VAT amount
            return (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.description}</td>
                <td>{item.duration}</td>
                <td>{item.startDate}</td> {/* Display Start Date */}
                <td>{item.endDate}</td> {/* Display End Date */}
                <td>{vatAmount.toFixed(2)}</td>
                <td>{item.amount.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="totalAmount-Contianer">
        <p>
          Total (Excl. VAT): SAR{" "}
          <span className="amounts">
            <b>{totalExcludingVat.toFixed(2)}</b>
          </span>
        </p>
        <p>
          Total VAT: SAR{" "}
          <span className="amounts">
            <b>{totalVat.toFixed(2)}</b>
          </span>
        </p>
        <p>
          Grand Total: SAR{" "}
          <span className="amounts grand-total">
            <b>{grandTotal.toFixed(2)}</b>
          </span>
        </p>
      </div>
      <button onClick={downloadInvoice} className="download-button">
        Download Invoice
      </button>{" "}
    </div>
  );
};

export default InvoiceTemplate;
