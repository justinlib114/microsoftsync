const axios = require('axios');
const auth = require('../lib/auth');
const { sendLicenseNotification } = require('./notification');

async function assignAdobeLicense(email, groupName) {
  const token = await auth.getAdobeToken();
  // Adobe API call to assign the license
  // Replace the URL and payload according to Adobe's API documentation
  await axios.post(
    `https://usermanagement.adobe.io/v2/usermanagement/users/${email}/groups/${groupName}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-api-key': config.adobe.client_id,
        'Content-Type': 'application/json',
      },
    }
  );

  await sendLicenseNotification(email, `Adobe ${groupName}`);
}

async function revokeAdobeLicense(email, groupName) {
  const token = await auth.getAdobeToken();
  // Adobe API call to revoke the license
  // Replace the URL and payload according to Adobe's API documentation
  await axios.delete(
    `https://usermanagement.adobe.io/v2/usermanagement/users/${email}/groups/${groupName}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-api-key': config.adobe.client_id,
        'Content-Type': 'application/json',
      },
    }
  );
}

module.exports = { assignAdobeLicense, revokeAdobeLicense };
