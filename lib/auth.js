const axios = require('axios');
const qs = require('qs');
const config = require('../config/config');

async function getLibCalToken() {
  const data = {
    client_id: config.libcal.client_id,
    client_secret: config.libcal.client_secret,
    grant_type: 'client_credentials',
  };

  const response = await axios.post(
    'https://greenburghlibrary.libcal.com/api/1.1/oauth/token',
    qs.stringify(data), // Properly encode the data for the body
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );
  return response.data.access_token;
}

async function getAdobeToken() {
  const response = await axios.post('https://ims-na1.adobelogin.com/ims/exchange/jwt/', {
    client_id: config.adobe.client_id,
    client_secret: config.adobe.client_secret,
    grant_type: 'client_credentials',
  });
  return response.data.access_token;
}

async function getMicrosoftToken() {
  const data = {
    client_id: config.microsoft.client_id,
    scope: "https://graph.microsoft.com/.default",
    client_secret: config.microsoft.client_secret,
    grant_type: "client_credentials",
  };

  const response = await axios.post(
    `https://login.microsoftonline.com/${config.microsoft.tenant_id}/oauth2/v2.0/token`,
    qs.stringify(data),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return response.data.access_token;
}

module.exports = { getLibCalToken, getAdobeToken, getMicrosoftToken };
