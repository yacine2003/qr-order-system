const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Configuration par défaut (devrait venir de la config/DB)
const RESTAURANT_INFO = {
    name: "Mon Restaurant",
    address: "123 Avenue de la Gastronomie",
    city: "75000 Paris",
    phone: "01 23 45 67 89",
    email: "contact@restaurant.com",
    siret: "123 456 789 00012",
    tva_intracom: "FR 12 123456789"
};

const pdfGenerator = {
    generateInvoice: async (order, res) => {
        const doc = new PDFDocument({ margin: 50 });

        // Stream le PDF directement dans la réponse HTTP
        doc.pipe(res);

        // --- EN-TÊTE ---
        doc
            .fillColor('#444444')
            .fontSize(20)
            .text('FACTURE / REÇU', 50, 57)
            .fontSize(10)
            .text(RESTAURANT_INFO.name, 200, 50, { align: 'right' })
            .text(RESTAURANT_INFO.address, 200, 65, { align: 'right' })
            .text(RESTAURANT_INFO.city, 200, 80, { align: 'right' })
            .moveDown();

        // --- INFOS FACTURE ---
        const invoiceNumber = 'FAC-' + new Date().getFullYear() + '-' + order.id.toString().padStart(6, '0');
        const dateObj = new Date(order.timestamp || new Date()); // Utiliser timestamp commande ou maintenant
        const invoiceDate = dateObj.toLocaleDateString('fr-FR');
        const invoiceTime = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        doc
            .text(`Numéro de facture: ${invoiceNumber}`, 50, 130)
            .text(`Date: ${invoiceDate} à ${invoiceTime}`, 50, 145)
            .text(`Table: ${order.table || 'Emporter'}`, 50, 160)

            .text(`Total réglé: ${order.total.toFixed(2)} €`, 300, 130, { align: 'right' })
            .moveDown();

        // --- LIGNE DE SÉPARATION ---
        doc
            .moveTo(50, 190)
            .lineTo(550, 190)
            .strokeColor('#aaaaaa')
            .stroke();

        // --- TABLEAU PRODUITS ---
        let i;
        const invoiceTableTop = 220;
        const tableHeaderY = invoiceTableTop;

        doc.font('Helvetica-Bold');

        // Headers
        doc
            .text("Description", 50, tableHeaderY)
            .text("Quantité", 300, tableHeaderY, { width: 90, align: "right" })
            .text("Prix Unit. TTC", 400, tableHeaderY, { width: 90, align: "right" })
            .text("Total", 500, tableHeaderY, { width: 40, align: "right" });

        doc.strokeColor("#aaaaaa")
            .moveTo(50, tableHeaderY + 15)
            .lineTo(550, tableHeaderY + 15)
            .stroke();

        doc.font('Helvetica');

        // Rows
        let position = tableHeaderY + 30;

        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
                const totalLine = item.price * item.quantity;

                // Check page break
                if (position > 700) {
                    doc.addPage();
                    position = 50;
                }

                doc
                    .text(item.name, 50, position)
                    .text(item.quantity.toString(), 300, position, { width: 90, align: "right" })
                    .text(item.price.toFixed(2) + " €", 400, position, { width: 90, align: "right" })
                    .text(totalLine.toFixed(2) + " €", 500, position, { width: 40, align: "right" });

                position += 20;
            });
        }

        // --- TOTAUX ---
        const subtotalPosition = position + 30;
        const VAT_RATE = 0.10;
        const totalTTC = order.total;
        const totalHT = totalTTC / (1 + VAT_RATE);
        const totalTVA = totalTTC - totalHT;

        doc.font('Helvetica-Bold');

        doc
            .text("Total HT", 400, subtotalPosition, { width: 90, align: "right" })
            .text(totalHT.toFixed(2) + " €", 500, subtotalPosition, { width: 40, align: "right" });

        doc
            .text("TVA (10%)", 400, subtotalPosition + 15, { width: 90, align: "right" })
            .text(totalTVA.toFixed(2) + " €", 500, subtotalPosition + 15, { width: 40, align: "right" });

        doc
            .fontSize(12)
            .text("Total TTC", 400, subtotalPosition + 35, { width: 90, align: "right" })
            .text(totalTTC.toFixed(2) + " €", 500, subtotalPosition + 35, { width: 40, align: "right" });


        // --- PIED DE PAGE ---
        doc
            .fontSize(10)
            .text(
                "Merci de votre visite !",
                50,
                700,
                { align: "center", width: 500 }
            );

        doc.end();
    }
};

module.exports = pdfGenerator;
