const libcal = require('./libcal');
const microsoft = require('./microsoft');
const adobe = require('./adobe');
const logger = require('../lib/logger');
const config = require('../config/config');

async function syncLicenses() {
  try {
    logger.info('Starting license sync process...');

    const bookings = await libcal.getBookings({
      locationId: process.env.LIBCAL_LOCATION_ID,
      categoryId: process.env.LIBCAL_CATEGORY_ID,
      days: 7,
    });

    const confirmedBookings = bookings.filter(
      (b) => ['Confirmed', 'Checked Out'].includes(b.status) && b.firstName && b.lastName && b.email
    );

    logger.info('Confirmed bookings:', JSON.stringify(confirmedBookings, null, 2));

    // === Microsoft Sync (UNCHANGED) ===
    for (const software of config.software) {
      if (!software.active || !software.skuId) {
        logger.warn(`Skipping software: ${software.productName}`);
        continue;
      }

      if (software.vendor.toLowerCase() !== 'microsoft') continue;

      const activeUsers = new Set();

      for (const booking of confirmedBookings) {
        const { firstName, lastName, email } = booking;

        try {
          let user = await microsoft.getUserByName(firstName, lastName);
          if (!user) user = await microsoft.createUser(email, firstName, lastName);

          await microsoft.ensureLicenseWithDisabledPlans(
            user.id,
            software.skuId,
            software.disabledPlans,
            software.productName
          );

          activeUsers.add(user.displayName.toUpperCase());
        } catch (err) {
          logger.error(`Error processing license for ${firstName} ${lastName}: ${err.message}`);
        }
      }

      try {
        const assignedUsers = await microsoft.getUsersWithLicense(software.skuId);
        for (const user of assignedUsers) {
          if (!activeUsers.has(user.displayName.toUpperCase())) {
            await microsoft.revokeMicrosoftLicense(user.id, software.skuId);
            logger.info(`Revoked license (${software.productName}) from ${user.displayName}`);
          }
        }
      } catch (err) {
        logger.error(`Error revoking licenses for ${software.productName}: ${err.message}`);
      }
    }

    // === Adobe Sync (NEW SECTION) ===
    for (const software of config.software) {
      if (!software.active || software.vendor.toLowerCase() !== 'adobe') continue;

      const activeEmails = new Set();

      for (const booking of confirmedBookings) {
        const { email, cid } = booking;

        if (software.libCalCid && software.libCalCid !== cid.toString()) continue;

        try {
          await adobe.assignAdobeLicense(email);
          activeEmails.add(email.toLowerCase());
        } catch (err) {
          logger.error(`Error assigning Adobe license to ${email}: ${err.message}`);
        }
      }

      try {
        const previouslyAssigned = adobe.getUsersWithLicense();
        for (const email of previouslyAssigned) {
          if (!activeEmails.has(email.toLowerCase())) {
            await adobe.revokeAdobeLicense(email);
            logger.info(`Revoked Adobe license from ${email}`);
          }
        }
      } catch (err) {
        logger.error(`Error revoking Adobe licenses for ${software.productName}: ${err.message}`);
      }
    }

    logger.info('License sync process completed successfully.');
  } catch (err) {
    logger.error('Error during license sync:', err);
  }
}

module.exports = { syncLicenses };
