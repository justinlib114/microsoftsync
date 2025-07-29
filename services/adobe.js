const axios = require('axios');
const fs = require('fs');
const path = require('path');
const auth = require('../lib/auth');
const config = require('../config/config');
const { sendLicenseNotification } = require('./notification');

const CACHE_PATH = path.join(__dirname, '../data/adobe-users.json');

function loadAssignedUsers() {
  try {
    const json = fs.readFileSync(CACHE_PATH, 'utf-8');
    return JSON.parse(json);
  } catch {
    return [];
  }
}

function saveAssignedUsers(emails) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(emails, null, 2));
}

function getAdobeUserPayload(email) {
  return {
    email,
    country: 'US',
    domain: config.adobe.domain,
  };
}

async function assignAdobeLicense(email) {
  const token = await auth.getAdobeToken();

  const payload = [
    {
      user: getAdobeUserPayload(email),
      product: [
        {
          productId: config.adobe.productId,
          productProfileId: config.adobe.productProfileId
        }
      ]
    }
  ];

  try {
    await axios.post(
      'https://usermanagement.adobe.io/v2/usermanagement/action',
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-api-key': config.adobe.client_id,
          'x-gw-ims-org-id': config.adobe.org_id,
          'Content-Type': 'application/json'
        }
      }
    );

    const assigned = loadAssignedUsers();
    const emailLower = email.toLowerCase();
    if (!assigned.includes(emailLower)) {
      assigned.push(emailLower);
      saveAssignedUsers(assigned);
    }

    await sendLicenseNotification(email, 'Adobe Acrobat');

    console.log(`✅ Assigned Adobe license to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to assign Adobe license to ${email}:`, error.response?.data || error.message);
    throw error;
  }
}

async function revokeAdobeLicense(email) {
  const token = await auth.getAdobeToken();

  const payload = [
    {
      user: getAdobeUserPayload(email),
      delete: true
    }
  ];

  try {
    await axios.post(
      'https://usermanagement.adobe.io/v2/usermanagement/action',
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-api-key': config.adobe.client_id,
          'x-gw-ims-org-id': config.adobe.org_id,
          'Content-Type': 'application/json'
        }
      }
    );

    const assigned = loadAssignedUsers();
    const updated = assigned.filter(e => e !== email.toLowerCase());
    saveAssignedUsers(updated);

    console.log(`🗑️ Revoked Adobe license from ${email}`);
  } catch (error) {
    console.error(`❌ Failed to revoke Adobe license from ${email}:`, error.response?.data || error.message);
    throw error;
  }
}

function getUsersWithLicense() {
  return loadAssignedUsers(); // returns an array of email strings
}

module.exports = {
  assignAdobeLicense,
  revokeAdobeLicense,
  getUsersWithLicense
};
