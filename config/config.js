require('dotenv').config();

const disabledPlans = [
  'dcf9d2f4-772e-4434-b757-77a453cfbc02', // Avatars for Teams
  '3efbd4ed-8958-4824-8389-1321f8730af8', // Avatars for Teams (additional)
  '9aaf7827-d63c-4b61-89c3-182f06f82e5c', // Exchange Online (Plan 1) - if you truly want off
  '33c4f319-9bdd-48d6-9c4d-410b750a4a5a', // Insights by MyAnalytics
  '199a5c09-e0ca-4e37-8f7c-b05d533e1ea2', // Microsoft Bookings
  'c4b8c31a-fb44-4c65-9837-a21f55fcabda', // Microsoft Loop
  'b737dad2-2f6c-4c65-90e3-ca563267e8b9', // Microsoft Planner
  '3c53ea51-d578-46fa-a4c0-fd0a92809a60', // Stream for Office 365
  '882e1d05-acd1-4ccb-8708-6ee03664b117', // MDM for Office 365
  '92f7a6f3-b89b-4bbd-8c30-809e6da5ad1c', // Power Apps for Office 365
  '0f9b09cb-62d1-4ff4-9129-43f4996f83f4', // Power Automate for Office 365
  '041fe683-03e4-45b6-b1af-c0cdc516daee', // Power Virtual Agents for Office 365
  'a23b959c-7ce8-4e57-9140-b90eb88a9e97', // Sway
  'a82fbf69-b4d7-49f4-83a6-915b2cf354f4', // Viva Engage Core
  'b76fb638-6ba6-402a-b9f9-83d28acb3d86', // Viva Learning Seeded
  'b8afc642-032e-4de5-8c0a-507a7bba7e5d', // Whiteboard (Plan 1)
];


module.exports = {
  libcal: {
    client_id: process.env.LIBCAL_CLIENT_ID,
    client_secret: process.env.LIBCAL_CLIENT_SECRET,
    location_id: process.env.LIBCAL_LOCATION_ID,
    category_id: process.env.LIBCAL_CATEGORY_ID,
  },
  adobe: {
    client_id: process.env.ADOBE_CLIENT_ID,
    client_secret: process.env.ADOBE_CLIENT_SECRET,
  },
  microsoft: {
    client_id: process.env.MICROSOFT_CLIENT_ID,
    client_secret: process.env.MICROSOFT_CLIENT_SECRET,
    tenant_id: process.env.MICROSOFT_TENANT_ID,
    restrictedGroupId: process.env.MICROSOFT_RESTRICTED_GROUP_ID,
  },
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  cron_schedule: '*/10 * * * *', // Every 10 minutes
  software: [
    {
      vendor: 'Adobe',
      productName: 'Adobe Acrobat',
      vendorGroupName: 'Library Acrobat Patrons',
      vendorGroupId: '123456789',
      libCalName: 'Adobe Acrobat License',
      libCalCid: process.env.LIBCAL_ADOBE_CID || '11111',
      active: false,
    },
    ...Array.from({ length: 10 }).map((_, index) => ({
      vendor: 'Microsoft',
      productName: 'Microsoft Business Standard',
      skuId: process.env[`MICROSOFT_SKU_ID_${index + 1}`],
      libCalName: 'Microsoft Business Standard - Word, Excel, PowerPoint',
      libCalCid: process.env[`MICROSOFT_LIBCAL_CID_${index + 1}`],
      disabledPlans,
      active: true,
    })),
  ],
};
