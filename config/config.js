require('dotenv').config();

const disabledPlans = [
'92f7a6f3-b89b-4bbd-8c30-809e6da5ad1c',	//Power Apps for Office 365
'0f9b09cb-62d1-4ff4-9129-43f4996f83f4',	//Power Automate for Office 365
'0683001c-0492-4d59-9515-d9a6426b5813',	//Power Virtual Agents for Office 365
'39b5c996-467e-4e60-bd62-46066f572726',	//Microsoft Invoicing
'9aaf7827-d63c-4b61-89c3-182f06f82e5c',	//Exchange Online (Plan 1)
'33c4f319-9bdd-48d6-9c4d-410b750a4a5a',	//Insights by MyAnalytics
'6f23d6a9-adbf-481c-8538-b4c095654487',	//Microsoft 365 Lighthouse (Plan 1)
'199a5c09-e0ca-4e37-8f7c-b05d533e1ea2',	//Microsoft Bookings
'54fc630f-5a40-48ee-8965-af0503c1386e',	//Microsoft Kaizala Pro
'c4b8c31a-fb44-4c65-9837-a21f55fcabda',	//Microsoft Loop
'b737dad2-2f6c-4c65-90e3-ca563267e8b9',	//Microsoft Planner
'882e1d05-acd1-4ccb-8708-6ee03664b117',	//Mobile Device Management for Office 365
'041fe683-03e4-45b6-b1af-c0cdc516daee',	//Power Virtual Agents for Office 365

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
      productName: 'Microsoft Business Premium',
      skuId: process.env[`MICROSOFT_SKU_ID_${index + 1}`],
      libCalName: 'Microsoft Business Premium - Word, Excel, PowerPoint',
      libCalCid: process.env[`MICROSOFT_LIBCAL_CID_${index + 1}`],
      disabledPlans,
      active: true,
    })),
  ],
};
