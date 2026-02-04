const { stringify } = require('csv-stringify/sync');
const config = require('../config');

// Helper pour formater la date
function formatDate(isoString) {
    if (!isoString) return '';
    return new Date(isoString).toLocaleString('fr-FR');
}

// Helper pour formater la date (jour seulement)
function formatDay(isoString) {
    if (!isoString) return '';
    return new Date(isoString).toISOString().split('T')[0];
}

const csvGenerator = {
    // Export détaillé (1 ligne par item de commande)
    generateDetailedExport: (orders) => {
        // Calcul TVA approximative (si non définie, on assume 10% pour la démo)
        const VAT_RATE = 0.10;

        // Aplatir les commandes en lignes de produits
        const records = [];

        orders.forEach(order => {
            // Si la commande n'a pas d'items (bizarre mais possible), on la met quand même
            if (!order.items || order.items.length === 0) {
                records.push({
                    order_id: order.id,
                    date: formatDate(order.timestamp),
                    status: order.status,
                    table: order.table,
                    total_order: order.total,
                    item_name: 'N/A',
                    quantity: 0,
                    unit_price: 0,
                    total_line: 0
                });
                return;
            }

            order.items.forEach(item => {
                const unitPriceTTC = item.price;
                const qty = item.quantity;
                const totalLineTTC = unitPriceTTC * qty;

                // Calcul inverse HT : Prix / (1 + Taux)
                const unitPriceHT = unitPriceTTC / (1 + VAT_RATE);
                const totalLineHT = totalLineTTC / (1 + VAT_RATE);
                const vatAmount = totalLineTTC - totalLineHT;

                records.push({
                    order_id: order.id,
                    created_at: formatDate(order.timestamp),
                    status: order.status,
                    table: order.table,

                    item_name: item.name,
                    category: 'N/A', // L'info n'est pas toujours dans l'objet item stocké, à voir
                    quantity: qty,
                    unit_price_ttc: unitPriceTTC.toFixed(2),
                    unit_price_ht: unitPriceHT.toFixed(2),
                    vat_rate: (VAT_RATE * 100) + '%',
                    vat_amount: vatAmount.toFixed(2),
                    total_line_ttc: totalLineTTC.toFixed(2),
                    total_line_ht: totalLineHT.toFixed(2)
                });
            });
        });

        return stringify(records, {
            header: true,
            columns: [
                { key: 'order_id', header: 'ID Commande' },
                { key: 'created_at', header: 'Date/Heure' },
                { key: 'status', header: 'Statut' },
                { key: 'table', header: 'Table' },
                { key: 'item_name', header: 'Produit' },
                { key: 'quantity', header: 'Quantité' },
                { key: 'unit_price_ttc', header: 'PU TTC' },
                { key: 'unit_price_ht', header: 'PU HT' },
                { key: 'total_line_ttc', header: 'Total Ligne TTC' },
                { key: 'total_line_ht', header: 'Total Ligne HT' },
                { key: 'vat_amount', header: 'Montant TVA' }
            ]
        });
    },

    // Export Résumé journalier (1 ligne par jour)
    generateDailySummary: (orders) => {
        const VAT_RATE = 0.10;
        const summary = {};

        orders.forEach(order => {
            const day = formatDay(order.timestamp);

            if (!summary[day]) {
                summary[day] = {
                    date: day,
                    orders_count: 0,
                    gross_sales_ttc: 0,
                    items_count: 0
                };
            }

            // Seulement les commandes valides (non annulées si on veut, ici on prend tout sauf annulé ?)
            // On va inclure tout et ajouter une colonne pour les annulées si besoin.
            // Pour l'instant, on compte tout le chiffre d'affaires des commandes 'payées' ou 'servies'.
            // Simplification: on somme tout ce qui n'est pas explicitement 'cancelled' (si ce statut existe)

            summary[day].orders_count += 1;
            summary[day].gross_sales_ttc += order.total;

            if (order.items) {
                summary[day].items_count += order.items.reduce((acc, item) => acc + item.quantity, 0);
            }
        });

        // Conversion en tableau
        const records = Object.values(summary).map(dayData => {
            const salesHT = dayData.gross_sales_ttc / (1 + VAT_RATE);
            const vatTotal = dayData.gross_sales_ttc - salesHT;

            return {
                date: dayData.date,
                orders_count: dayData.orders_count,
                items_count: dayData.items_count,
                gross_sales_ttc: dayData.gross_sales_ttc.toFixed(2),
                gross_sales_ht: salesHT.toFixed(2),
                vat_total: vatTotal.toFixed(2)
            };
        });

        // Tri par date
        records.sort((a, b) => b.date.localeCompare(a.date));

        return stringify(records, {
            header: true,
            columns: [
                { key: 'date', header: 'Date' },
                { key: 'orders_count', header: 'Nb Commandes' },
                { key: 'items_count', header: 'Nb Articles' },
                { key: 'gross_sales_ttc', header: 'CA Total TTC' },
                { key: 'gross_sales_ht', header: 'CA Total HT' },
                { key: 'vat_total', header: 'TVA Totale' }
            ]
        });
    }
};

module.exports = csvGenerator;
