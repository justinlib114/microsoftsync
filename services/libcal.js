const axios = require('axios');
const auth = require('../lib/auth');
const logger = require('../lib/logger');

async function getBookings({ locationId, categoryId, days = 0 }) {
  const token = await auth.getLibCalToken();
  const currentDate = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

  try {
    const response = await axios.get('https://greenburghlibrary.libcal.com/api/1.1/equipment/bookings', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        lid: locationId,
        cid: categoryId,
        days,
        date: currentDate,
        limit: 100, // Adjust limit as necessary
      },
    });

    logger.info('Fetched bookings from LibCal:', response.data);
    return response.data;
  } catch (error) {
    logger.error(`Error fetching bookings from LibCal: ${error.message}`);
    throw error;
  }
}

module.exports = { getBookings };
