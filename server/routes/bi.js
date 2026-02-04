const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const csvGenerator = require('../services/csvGenerator');
const pdfGenerator = require('../services/pdfGenerator');
const { requireAuth } = require('../middleware/auth');

// Chemin vers le fichier des commandes
const ordersFile = path.join(__dirname, '../data/orders.json');

// Helper pour lire les commandes
function getOrders() {
    try {
        if (!fs.existsSync(ordersFile)) return [];
        const data = fs.readFileSync(ordersFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Erreur lecture orders", error);
        return [];
    }
}

// Middleware d'authentification pour toutes les routes BI
router.use(requireAuth);

// EXPORT CSV DÉTAILLÉ
router.get('/export/csv/detailed', (req, res) => {
    try {
        const orders = getOrders();
        const csvData = csvGenerator.generateDetailedExport(orders);

        res.header('Content-Type', 'text/csv');
        res.attachment(`commandes_detaillees_${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csvData);
    } catch (error) {
        console.error("Erreur export CSV détaillé", error);
        res.status(500).send("Erreur lors de la génération du CSV");
    }
});

// EXPORT CSV RÉSUMÉ
router.get('/export/csv/summary', (req, res) => {
    try {
        const orders = getOrders();
        const csvData = csvGenerator.generateDailySummary(orders);

        res.header('Content-Type', 'text/csv');
        res.attachment(`resume_journalier_${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csvData);
    } catch (error) {
        console.error("Erreur export CSV résumé", error);
        res.status(500).send("Erreur lors de la génération du CSV");
    }
});

// LISTE DES FACTURES (JSON)
router.get('/invoices', (req, res) => {
    try {
        const { date } = req.query; // Format YYYY-MM-DD optionnel
        const orders = getOrders();

        let targetDate = date ? date : new Date().toISOString().split('T')[0];

        // Filtrer par date
        const dailyOrders = orders.filter(o => {
            if (!o.timestamp) return false;
            return o.timestamp.startsWith(targetDate);
        });

        // Formater pour l'UI
        const invoices = dailyOrders.map(o => ({
            id: o.id,
            timestamp: o.timestamp,
            time: new Date(o.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            table: o.table,
            total: o.total,
            status: o.status,
            itemsCount: o.items ? o.items.length : 0
        }));

        // Trier par Table (croissant) puis Temps (chronologique)
        invoices.sort((a, b) => {
            const tableA = a.table ? String(a.table) : 'ZZZ'; // Sans table à la fin
            const tableB = b.table ? String(b.table) : 'ZZZ';

            // Tri numérique des tables (ex: "Table 2" avant "Table 10")
            const tableDiff = tableA.localeCompare(tableB, undefined, { numeric: true });
            if (tableDiff !== 0) return tableDiff;

            // Si même table, ordre chronologique (Ancien -> Récent)
            return new Date(a.timestamp) - new Date(b.timestamp);
        });

        res.json({
            date: targetDate,
            count: invoices.length,
            totalSales: invoices.reduce((acc, curr) => acc + curr.total, 0),
            invoices: invoices
        });

    } catch (error) {
        console.error("Erreur liste factures", error);
        res.status(500).json({ error: "Erreur lecture factures" });
    }
});


// EXPORT FACTURE PDF
router.get('/export/invoice/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { mode } = req.query; // 'simple' ou undefined (défaut detailed)
        const detailed = mode !== 'simple';

        const orders = getOrders();
        // Recherche flexible (numérique ou string)
        const order = orders.find(o => o.id == orderId); // == pour cast auto

        if (!order) {
            return res.status(404).send("Commande non trouvée");
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=facture_${orderId}.pdf`);

        await pdfGenerator.generateInvoice(order, res, detailed);

    } catch (error) {
        console.error("Erreur génération PDF", error);
        if (!res.headersSent) {
            res.status(500).send("Erreur lors de la génération du PDF");
        }
    }
});

module.exports = router;
