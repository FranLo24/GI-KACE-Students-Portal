require('dotenv').config();
const app = require('./src/app');
const { syncCoursesFromInvoice } = require('./src/services/invoiceCourseSync');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Keeps the course catalogue in sync with the invoice site's product list.
// No-op (skipped) when INVOICE_API_KEY isn't configured yet — admins can still
// use the manual "Sync from Invoice" button in Course Management once it is,
// or wait for this interval.
if (process.env.INVOICE_API_KEY) {
  const intervalMinutes = Number(process.env.INVOICE_SYNC_INTERVAL_MINUTES) || 30;

  const runInvoiceSync = () => {
    syncCoursesFromInvoice()
      .then((result) => {
        if (!result.skipped) {
          console.log(`[invoiceCourseSync] ${result.created} created, ${result.updated} updated, ${result.disabled} disabled.`);
        }
      })
      .catch((error) => console.error('[invoiceCourseSync] sync failed:', error.message));
  };

  runInvoiceSync();
  setInterval(runInvoiceSync, intervalMinutes * 60 * 1000);
}
