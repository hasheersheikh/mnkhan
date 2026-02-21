const PDFDocument = require('pdfkit');

/**
 * Generate a professional invoice PDF as a buffer
 * @param {Object} data Invoice data (customer, items, total, date, invoiceNumber)
 * @returns {Promise<Buffer>} PDF data buffer
 */
const generateInvoicePDF = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const result = Buffer.concat(buffers);
        resolve(result);
      });

      // Header
      doc
        .fillColor('#444444')
        .fontSize(20)
        .text('MN KHAN & ASSOCIATES', 50, 50)
        .fontSize(10)
        .text('Legal Consultants & Practitioners', 50, 75)
        .text('R-46, 2nd Floor, Khirki Extension', 50, 90)
        .text('Malviya Nagar, New Delhi - 110017', 50, 105)
        .moveDown();

      // Invoice Label
      doc
        .fillColor('#E67E22') // MN Khan Orange
        .fontSize(28)
        .text('INVOICE', 50, 160, { align: 'right' });

      doc
        .fillColor('#444444')
        .fontSize(10)
        .text(`Invoice Number: ${data.invoiceNumber || 'INV-' + Date.now().toString().slice(-6)}`, 50, 200, { align: 'right' })
        .text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 50, 215, { align: 'right' })
        .moveDown();

      // Bill To
      doc
        .fontSize(12)
        .fillColor('#000000')
        .text('Bill To:', 50, 200)
        .fontSize(10)
        .fillColor('#444444')
        .text(data.customer.name, 50, 215)
        .text(data.customer.email, 50, 230)
        .moveDown();

      // Table Header
      const tableTop = 300;
      doc
        .fontSize(10)
        .fillColor('#444444')
        .text('Description', 50, tableTop)
        .text('Amount (INR)', 450, tableTop, { align: 'right' });

      doc
        .strokeColor('#aaaaaa')
        .lineWidth(1)
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

      // Table Items
      let currentY = tableTop + 25;
      data.items.forEach(item => {
        doc
          .fontSize(10)
          .text(item.description, 50, currentY)
          .text(`₹${item.amount.toLocaleString('en-IN')}`, 450, currentY, { align: 'right' });
        currentY += 20;
      });

      // Total
      const totalY = Math.max(currentY + 20, 400);
      doc
        .strokeColor('#aaaaaa')
        .lineWidth(1)
        .moveTo(350, totalY)
        .lineTo(550, totalY)
        .stroke();

      doc
        .fontSize(12)
        .fillColor('#444444')
        .text('Total Amount:', 350, totalY + 10)
        .fillColor('#E67E22')
        .text(`₹${data.total.toLocaleString('en-IN')}`, 450, totalY + 10, { align: 'right' });

      // Footer
      doc
        .fontSize(10)
        .fillColor('#aaaaaa')
        .text('Thank you for choosing MN Khan & Associates.', 50, 700, { align: 'center', width: 500 })
        .text('This is a computer generated invoice and does not require a physical signature.', 50, 715, { align: 'center', width: 500 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateInvoicePDF };
