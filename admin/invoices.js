// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('dateFilter');
    dateInput.value = today;

    // Load initial data
    loadInvoices();

    // Listen for date changes
    dateInput.addEventListener('change', loadInvoices);
});

async function loadInvoices() {
    const listContainer = document.getElementById('invoicesList');
    const totalSalesEl = document.getElementById('totalSales');
    const countEl = document.getElementById('invoicesCount');
    const dateInput = document.getElementById('dateFilter');

    listContainer.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-400">Chargement...</td></tr>';

    try {
        const response = await fetch(`/api/bi/invoices?date=${dateInput.value}`);
        if (!response.ok) throw new Error("Erreur chargement factures");

        const data = await response.json();

        // Update stats
        totalSalesEl.textContent = data.totalSales.toFixed(2) + ' €';
        countEl.textContent = data.count;

        // Render List
        if (data.invoices.length === 0) {
            listContainer.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-12 text-gray-400">
                        Aucune facture trouvée pour cette date.
                    </td>
                </tr>
            `;
            return;
        }

        listContainer.innerHTML = data.invoices.map(invoice => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 text-gray-600 font-medium">${invoice.time}</td>
                <td class="px-6 py-4 font-mono text-sm text-gray-500">#${invoice.id}</td>
                <td class="px-6 py-4">
                    <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-semibold">
                        Table ${invoice.table || 'N/A'}
                    </span>
                </td>
                <td class="px-6 py-4 text-right font-bold text-gray-800">
                    ${invoice.total.toFixed(2)} €
                </td>
                <td class="px-6 py-4 text-center text-gray-500">
                    ${invoice.itemsCount}
                </td>
                <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                        <button onclick="downloadInvoice('${invoice.id}', true)" 
                                title="Facture détaillée"
                                class="inline-flex items-center gap-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-2 py-1.5 rounded text-xs font-medium transition-all shadow-sm">
                            <span>📝</span> Détail
                        </button>
                        <button onclick="downloadInvoice('${invoice.id}', false)" 
                                title="Ticket global"
                                class="inline-flex items-center gap-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-2 py-1.5 rounded text-xs font-medium transition-all shadow-sm">
                            <span>💶</span> Total
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error(error);
        listContainer.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-8 text-red-500 font-medium">
                    Erreur lors du chargement des données.
                </td>
            </tr>
        `;
    }
}

function downloadInvoice(orderId, detailed = true) {
    const mode = detailed ? 'detailed' : 'simple';
    window.open(`/api/bi/export/invoice/${orderId}?mode=${mode}`, '_blank');
}
