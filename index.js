const express = require('express');
const cron = require('node-cron');
const { syncLicenses } = require('./services/sync');
const {
  createUser,
  assignMicrosoftLicense,
  revokeMicrosoftLicense,
} = require('./services/microsoft');
const auth = require('./lib/auth');
const logger = require('./lib/logger');
const axios = require('axios');

const app = express();

// Helper function to convert LibCal email to Azure AD email
function getAdUserEmail(email) {
  const emailPrefix = email.split('@')[0];
  const verifiedDomain = 'greenburghlib.onmicrosoft.com'; // Your Azure AD domain
  return `${emailPrefix}@${verifiedDomain}`;
}

// Root endpoint
app.get('/', (req, res) => {
  res.send('LibCal Adobe/Microsoft License Sync Service is running.');
});

// Route to manually trigger the sync process
app.get('/sync', async (req, res) => {
  try {
    await syncLicenses();
    res.status(200).send('Sync completed successfully.');
  } catch (error) {
    logger.error('Manual sync failed:', error);
    res.status(500).send('Sync failed.');
  }
});

// Route to fetch Microsoft subscribed SKUs
app.get('/microsoft/skus', async (req, res) => {
  try {
    const token = await auth.getMicrosoftToken();

    // Fetch subscribed SKUs
    const response = await axios.get('https://graph.microsoft.com/v1.0/subscribedSkus', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    logger.error(
      'Error fetching Microsoft SKUs:',
      error.response?.data || error.message,
      error
    );
    res.status(500).send('Failed to fetch Microsoft SKUs.');
  }
});







// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}.`);
});
