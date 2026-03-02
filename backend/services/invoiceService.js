const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

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

      // --- HEADER ---
      // Logo text
      doc.fillColor('#333132')
         .font('Helvetica-Bold')
         .fontSize(24)
         .text('M.N KHAN', 50, 45, { continued: true })
         .fillColor('#FF4612')
         .text('.');

      doc.fillColor('#333132')
         .font('Helvetica')
         .fontSize(14)
         .text('& Associates', 50, 75);

      doc.font('Helvetica-Oblique')
         .fontSize(11)
         .text('Defining the Future of Law.', 50, 95);

      // Invoice Title and Horizontal Line
      const invoiceTitleY = 110;
      doc.strokeColor('#BCBCBC')
         .lineWidth(1)
         .moveTo(50, invoiceTitleY + 20)
         .lineTo(320, invoiceTitleY + 20)
         .stroke();

      doc.fillColor('#333132')
         .font('Helvetica')
         .fontSize(44)
         .text('INVOICE', 350, invoiceTitleY, { align: 'right' });

      // --- CLIENT & DATE INFO ---
      const infoY = 180;
      
      // Issued To (Left)
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#333132').text('ISSUED TO:', 50, infoY);
      doc.font('Helvetica').fontSize(10).fillColor('#333132');
      doc.text(data.customer.name, 50, infoY + 15);
      if (data.customer.company) doc.text(data.customer.company, 50, infoY + 30);

      // Pay To (Left, below Issued To)
      const payToY = infoY + 80;
      doc.font('Helvetica-Bold').fontSize(10).text('PAY TO:', 50, payToY);
      doc.font('Helvetica').fontSize(10);
      doc.text('MN Khan & Associates', 50, payToY + 15);

      // Invoice Metadata (Right)
      const metaX = 350;
      const rowHeight = 15;
      
      doc.font('Helvetica-Bold').text('INVOICE NO:', metaX, infoY, { align: 'right', width: 120 });
      doc.font('Helvetica').text(data.invoiceNumber || 'INV-0123', metaX + 130, infoY, { align: 'left' });

      doc.font('Helvetica-Bold').text('DATE:', metaX, infoY + rowHeight, { align: 'right', width: 120 });
      doc.font('Helvetica').text(new Date().toLocaleDateString('en-GB').replace(/\//g, '.'), metaX + 130, infoY + rowHeight, { align: 'left' });

      // --- TABLE ---
      const tableTop = 380;
      doc.strokeColor('#333132')
         .lineWidth(1)
         .moveTo(50, tableTop)
         .lineTo(550, tableTop)
         .stroke();

      doc.font('Helvetica-Bold').fontSize(9).fillColor('#333132');
      doc.text('DESCRIPTION', 50, tableTop + 10);
      doc.text('UNIT PRICE', 300, tableTop + 10, { width: 80, align: 'right' });
      doc.text('QTY', 400, tableTop + 10, { width: 50, align: 'right' });
      doc.text('TOTAL', 480, tableTop + 10, { width: 70, align: 'right' });

      doc.moveTo(50, tableTop + 25)
         .lineTo(550, tableTop + 25)
         .stroke();

      let currentY = tableTop + 40;
      doc.font('Helvetica').fontSize(9);
      
      data.items.forEach(item => {
        doc.text(item.description, 50, currentY, { width: 230 });
        doc.text(`₹${item.amount.toLocaleString()}`, 300, currentY, { width: 80, align: 'right' });
        doc.text(item.qty || '1', 400, currentY, { width: 50, align: 'right' });
        const lineTotal = item.amount * (item.qty || 1);
        doc.text(`₹${lineTotal.toLocaleString()}`, 480, currentY, { width: 70, align: 'right' });
        currentY += 25;
      });

      // --- SUMMARY ---
      currentY = Math.max(currentY + 20, 500);
      doc.strokeColor('#333132')
         .lineWidth(1)
         .moveTo(50, currentY)
         .lineTo(550, currentY)
         .stroke();

      const summaryX = 400;
      const summaryValX = 480;
      const subtotal = data.total || data.items.reduce((sum, item) => sum + (item.amount * (item.qty || 1)), 0);
      
      doc.font('Helvetica-Bold').text('SUBTOTAL', 50, currentY + 10);
      doc.text(`₹${subtotal.toLocaleString()}`, summaryValX, currentY + 10, { width: 70, align: 'right' });

      doc.font('Helvetica-Bold').fontSize(11).text('TOTAL', summaryX, currentY + 40, { width: 50, align: 'right' });
      const finalTotal = subtotal;
      doc.text(`₹${finalTotal.toLocaleString()}`, summaryValX, currentY + 40, { width: 70, align: 'right' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateInvoicePDF };
