require('dotenv').config();

const disabledPlans = [
  '1fe6227d-3e01-46d0-9510-0acad4ff6e94',
  'a6520331-d7d4-4276-95f5-15c0933bc757',
  'f0ff6ac6-297d-49cd-be34-6dfef97f0c28',
  '3efbd4ed-8958-4824-8389-1321f8730af8',
  'dcf9d2f4-772e-4434-b757-77a453cfbc02',
  'c4b8c31a-fb44-4c65-9837-a21f55fcabda',
  'a82fbf69-b4d7-49f4-83a6-915b2cf354f4',
  'b76fb638-6ba6-402a-b9f9-83d28acb3d86',
  '33c4f319-9bdd-48d6-9c4d-410b750a4a5a',
  'b8afc642-032e-4de5-8c0a-507a7bba7e5d',
  '199a5c09-e0ca-4e37-8f7c-b05d533e1ea2',
  '92f7a6f3-b89b-4bbd-8c30-809e6da5ad1c',
  '0f9b09cb-62d1-4ff4-9129-43f4996f83f4',
  'a23b959c-7ce8-4e57-9140-b90eb88a9e97',
  'b737dad2-2f6c-4c65-90e3-ca563267e8b9',
  '743dd19e-1ce3-4c62-a3ad-49ba8f63a2f6',
  '9aaf7827-d63c-4b61-89c3-182f06f82e5c',
  '113feb6c-3fe4-4440-bddc-54d774bf0318',
  '176a09a6-7ec5-4039-ac02-b2791c6ba793',
  'ded3d325-1bdc-453e-8432-5bac26d7a014',
  '7547a3fe-08ee-4ccb-b430-5077c5041653',
  '8e229017-d77b-43d5-9305-903395523b99',
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
  org_id: process.env.ADOBE_ORG_ID,
  technical_account_id: process.env.ADOBE_TECHNICAL_ACCOUNT_ID,
  private_key: process.env.ADOBE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  domain: 'greenburghlibrary.org', // Adobe federated domain
  productId: process.env.ADOBE_PRODUCT_ID,
  productProfileId: process.env.ADOBE_PROFILE_ID,
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
    productName: 'Adobe Acrobat - Create, Edit, Merge PDFs (1)',
    vendorGroupName: 'Library Acrobat Patrons',
    vendorGroupId: '123456789',
    libCalName: 'Adobe Acrobat - Create, Edit, Merge PDFs',
    libCalCid: 'process.env.LIBCAL_ADOBE_CID_1',
    active: false,
  },
  {
    vendor: 'Adobe',
    productName: 'Adobe Acrobat - Create, Edit, Merge PDFs (2)',
    vendorGroupName: 'Library Acrobat Patrons',
    vendorGroupId: '123456789',
    libCalName: 'Adobe Acrobat - Create, Edit, Merge PDFs',
    libCalCid: 'process.env.LIBCAL_ADOBE_CID_2',
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
