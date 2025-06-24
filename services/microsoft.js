const axios = require('axios');
const auth = require('../lib/auth');
const logger = require('../lib/logger');

function getUserPrincipalName(email) {
  const emailPrefix = email.split('@')[0];
  const verifiedDomain = 'greenburghlib.onmicrosoft.com';
  return `${emailPrefix}@${verifiedDomain}`;
}

async function getUserByName(firstName, lastName) {
  const token = await auth.getMicrosoftToken();
  const displayName = `${firstName.toUpperCase()} ${lastName.toUpperCase()}`;

  try {
    const response = await axios.get(
      `https://graph.microsoft.com/v1.0/users?$filter=startswith(displayName, '${displayName}')`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.value.length > 0 ? response.data.value[0] : null;
  } catch (error) {
    logger.error(`Error fetching user by name (${displayName}): ${error.message}`);
    throw error;
  }
}

async function createUser(email, firstName, lastName) {
  const token = await auth.getMicrosoftToken();
  const userPrincipalName = getUserPrincipalName(email);

  const user = {
    accountEnabled: true,
    displayName: `${firstName.toUpperCase()} ${lastName.toUpperCase()}`,
    mailNickname: email.split('@')[0],
    userPrincipalName,
    usageLocation: 'US',
    passwordProfile: {
      forceChangePasswordNextSignIn: true,
      password: process.env.MICROSOFT_TEMP_PASSWORD,
    },
  };

  try {
    const response = await axios.post('https://graph.microsoft.com/v1.0/users', user, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    logger.info(`User created in Azure AD: ${response.data.displayName} (${userPrincipalName})`);
    return response.data;
  } catch (error) {
    logger.error(`Error creating user ${email}: ${error.response?.data?.error?.message || error.message}`);
    throw error;
  }
}

async function ensureLicenseWithDisabledPlans(userId, skuId, disabledPlans, productName) {
  const token = await auth.getMicrosoftToken();

  try {
    // Fetch user and current licenses
    const userResp = await axios.get(`https://graph.microsoft.com/v1.0/users/${userId}?$select=displayName,assignedLicenses`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { displayName, assignedLicenses = [] } = userResp.data;
    const existing = assignedLicenses.find((l) => l.skuId === skuId);

    const currentDisabled = (existing?.disabledPlans || []).sort();
    const desiredDisabled = (disabledPlans || []).sort();
    const currentStr = JSON.stringify(currentDisabled);
    const desiredStr = JSON.stringify(desiredDisabled);

    if (existing && currentStr === desiredStr) {
      logger.info(`User ${displayName} already has ${productName} with correct disabled plans. Skipping.`);
      return;
    }

    await axios.post(
      `https://graph.microsoft.com/v1.0/users/${userId}/assignLicense`,
      { addLicenses: [{ skuId, disabledPlans }], removeLicenses: [] },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    logger.info(
      `${existing ? 'Updated' : 'Assigned'} license (${productName}) for ${displayName} (${userId})`
    );
  } catch (error) {
    logger.error(`Failed to assign/update license for user ${userId}: ${error.message}`);
    throw error;
  }
}

async function revokeMicrosoftLicense(userId, skuId) {
  const token = await auth.getMicrosoftToken();

  try {
    const userResp = await axios.get(`https://graph.microsoft.com/v1.0/users/${userId}?$select=displayName`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const displayName = userResp.data.displayName;

    await axios.post(
      `https://graph.microsoft.com/v1.0/users/${userId}/assignLicense`,
      {
        addLicenses: [],
        removeLicenses: [skuId],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    logger.info(`Revoked license (SKU: ${skuId}) from ${displayName} (${userId})`);
  } catch (error) {
    logger.error(`Failed to revoke Microsoft license for user ID ${userId}: ${error.message}`);
    throw error;
  }
}

async function getUsersWithLicense(skuId) {
  const token = await auth.getMicrosoftToken();

  try {
    const response = await axios.get('https://graph.microsoft.com/v1.0/users?$select=id,displayName,assignedLicenses', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const usersWithLicense = response.data.value.filter(
      (user) => Array.isArray(user.assignedLicenses) && user.assignedLicenses.some((license) => license.skuId === skuId)
    );

    logger.info(`Fetched ${usersWithLicense.length} users with SKU ${skuId}`);
    return usersWithLicense;
  } catch (error) {
    logger.error(`Error fetching users with license SKU ${skuId}: ${error.message}`);
    throw error;
  }
}

module.exports = {
  getUserByName,
  createUser,
  ensureLicenseWithDisabledPlans,
  revokeMicrosoftLicense,
  getUsersWithLicense,
};
