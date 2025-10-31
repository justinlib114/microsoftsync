# LibCal Software License Sync — Render.com Deployment Guide

## Overview: What Does This Code Do?

This project **automates the management of Microsoft 365 (and optionally, Adobe) software licenses based on LibCal equipment bookings** at your organization.

- **Fetches reservations from LibCal** (library reservation system).
- **Checks if users exist in Azure Active Directory (AAD)**, creates them if needed.
- **Assigns Microsoft licenses** (with specific plans disabled) to users with active bookings.
- **Revokes licenses** from users who no longer have bookings.
- **Runs automatically on a schedule** and can be triggered manually via a web API.

---

## How the Code Works

### Main Flow

1. **Scheduled Sync**: Every X minutes (default: 10), the system fetches bookings from LibCal.
2. **Checks Bookings**: Only confirmed bookings are processed.
3. **User Management**:
   - For each booking:
     - Finds or creates a corresponding user in Microsoft Azure AD.
     - Assigns a Microsoft license (with specified plans disabled).
4. **License Cleanup**: Revokes Microsoft licenses from users who no longer have bookings.
5. **Web API**:
   - `/` — Health check.
   - `/sync` — Manually trigger license sync.
   - `/microsoft/skus` — View available Microsoft license SKUs.

### Key Files

- `config/config.js` — Configuration for APIs, software products, plans, and scheduling.
- `lib/auth.js` — Authenticates to LibCal, Microsoft, Adobe.
- `lib/logger.js` — Logging.
- `services/libcal.js` — LibCal API calls.
- `services/microsoft.js` — Microsoft Graph API calls.
- `services/sync.js` — Main sync logic.
- `index.js` — Express web server and API routes.
- `package.json` — Dependencies and scripts.

---

## How to Deploy on Render.com

### 1. Push Your Code to GitHub

If not already on GitHub, initialize and push your code:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<yourusername>/<yourrepo>.git
git push -u origin main
```

---

### 2. Create a Render Web Service

1. **Log in to [Render](https://render.com/)**
2. Click **"New Web Service"**
3. **Connect your GitHub repository**
4. Select the branch you want to deploy (usually `main`)
5. Set the **Environment** to **Node**
6. Set **Build Command**:
    ```
    npm install
    ```
7. Set **Start Command**:
    ```
    npm start
    ```
8. Select an appropriate instance type (Standard is fine for most use cases)

---

### 3. Add Environment Variables

Go to the **Environment** tab in your Render service and add all the required variables.
These replace your `.env` file.

**Example Required Variables:**

| Key                           | Example Value                | Description                        |
|-------------------------------|------------------------------|-------------------------------------|
| LIBCAL_CLIENT_ID              | xxxxxxxxxxxxxxxxxxxxxxxx     | LibCal API client ID                |
| LIBCAL_CLIENT_SECRET          | xxxxxxxxxxxxxxxxxxxxxxxx     | LibCal API client secret            |
| LIBCAL_LOCATION_ID            | xxxxxxxxxxxxxxxxxxxxxxxx     | LibCal location ID                  |
| LIBCAL_CATEGORY_ID            | xxxxxxxxxxxxxxxxxxxxxxxx     | LibCal category ID                  |
| ADOBE_CLIENT_ID               | xxxxxxxxxxxxxxxxxxxxxxxx     | Adobe API client ID                 |
| ADOBE_CLIENT_SECRET           | xxxxxxxxxxxxxxxxxxxxxxxx     | Adobe API client secret             |
| MICROSOFT_CLIENT_ID           | xxxxxxxxxxxxxxxxxxxxxxxx     | Azure AD App Registration client ID |
| MICROSOFT_CLIENT_SECRET       | xxxxxxxxxxxxxxxxxxxxxxxx     | Azure AD App Registration secret    |
| MICROSOFT_TENANT_ID           | xxxxxxxxxxxxxxxxxxxxxxxx     | Azure AD tenant ID                  |
| MICROSOFT_RESTRICTED_GROUP_ID | xxxxxxxxxxxxxxxxxxxxxxxx     | Azure AD group ID (if used)         |
| MICROSOFT_TEMP_PASSWORD       | TempPassword123!             | Temporary password for new users    |
| MICROSOFT_SKU_ID_1            | xxxxxxxxxxxxxxxxxxxxxxxx     | Microsoft license SKU ID            |
| MICROSOFT_LIBCAL_CID_1        | xxxxxxxxxxxxxxxxxxxxxxxx     | LibCal category ID for license      |

Add more `MICROSOFT_SKU_ID_X` and `MICROSOFT_LIBCAL_CID_X` for additional products if needed.

## 🔑 Environment Variables — Where to Find or Create Each Value

This section explains where each required environment variable comes from and how to generate it for your `.env` file or Render deployment.

---

### 🧭 Microsoft Azure AD / Entra ID

| Variable | Description | Where to Find / Create |
|-----------|--------------|------------------------|
| `MICROSOFT_CLIENT_ID` | Azure AD App Registration Client ID | **Azure Portal → Azure Active Directory → App registrations → [Your App] → Overview.** Copy the **Application (client) ID**. |
| `MICROSOFT_CLIENT_SECRET` | Secret used to authenticate API calls | **Azure Portal → Azure Active Directory → App registrations → [Your App] → Certificates & secrets → + New client secret.** Copy the **Secret Value** immediately — it’s only shown once. |
| `MICROSOFT_TENANT_ID` | Your organization’s unique Azure AD tenant ID | **Azure Active Directory → Overview → Tenant ID.** |
| `MICROSOFT_SKU_ID_X` | The license SKU (product) ID to assign | Use **Microsoft Graph Explorer** or PowerShell:<br>`Get-MgSubscribedSku \| Select SkuPartNumber, SkuId`<br>Find your SKU (e.g., `M365_BUSINESS_PREMIUM`) and copy its GUID. |
| `MICROSOFT_RESTRICTED_GROUP_ID` *(optional)* | Restrict license assignment to members of a group | **Azure Active Directory → Groups → [Your Group] → Overview → Object ID.** |
| `MICROSOFT_TEMP_PASSWORD` | Temporary password for new user accounts | Choose any strong password (e.g., `TempPassword123!`). Not auto-generated. |

---

### 🗓️ LibCal (Springshare)

| Variable | Description | Where to Find / Create |
|-----------|--------------|------------------------|
| `LIBCAL_CLIENT_ID` | LibCal API Client ID | **LibApps Dashboard → Admin → API → Authentication → Add API Client.** Copy the **Client ID**. |
| `LIBCAL_CLIENT_SECRET` | LibCal API Client Secret | Same page as above — generated when you create the API client. |
| `LIBCAL_LOCATION_ID` | ID for your equipment/space location | **LibCal → Equipment & Spaces → Locations.** Hover over the location name and check the URL (e.g., `/manage/locations/1234` → `1234`). |
| `LIBCAL_CATEGORY_ID` | ID for your equipment category | **LibCal → Equipment & Spaces → Categories.** Hover over the category and check the URL (e.g., `/manage/categories/5678` → `5678`). |
| `MICROSOFT_LIBCAL_CID_X` | Category ID associated with each software license | Use the same method above — corresponds to the category that triggers license assignment. |

---

### 🖋️ Adobe (Optional)

| Variable | Description | Where to Find / Create |
|-----------|--------------|------------------------|
| `ADOBE_CLIENT_ID` | Adobe API Client ID | **Adobe Developer Console → Create new project → Add API → User Management API → Service Account (JWT/OAuth).** Copy the **Client ID**. |
| `ADOBE_CLIENT_SECRET` | Adobe API Client Secret | Found in your Adobe Developer Console project credentials. |
| `ADOBE_TECHNICAL_ACCOUNT_ID` *(if used)* | Adobe Service Account identifier | Found under your **Service Account (JWT/OAuth)** credentials. |
| `ADOBE_ORG_ID` | Adobe Organization ID | Found under the same credentials section as above. |

---

### ⚙️ General / System

| Variable | Description | Where to Find / Create |
|-----------|--------------|------------------------|
| `PORT` | Port Render assigns for your app | Automatically set by Render — no need to define manually. |
| `NODE_ENV` | Node.js environment mode | Optional — set to `production` when deployed. |


---

### 4. Deploy & Test

- Click **"Create Web Service"**.
- Render will install dependencies and start your app.
- Your service will be publicly accessible at the provided URL (e.g., `https://your-app.onrender.com`).

**Test the endpoints:**
- Open your app URL in a browser — you should see the health check message.
- Use `/sync` to manually trigger a license sync.
- Use `/microsoft/skus` to list available Microsoft SKUs.

---

### 5. Scheduled Sync

- The sync job runs automatically inside the Node app (via node-cron).
- No extra scheduling is needed on Render.

---

## Troubleshooting & Tips

- **Azure AD Setup:** Register an app in Azure AD and grant required Graph API permissions.
- **LibCal Setup:** Obtain API credentials from your LibCal admin.
- **Email Issues:** Check SMTP/app password, and Render’s outbound email policy.
- **Logs:** Use Render’s log viewer for debugging. The app logs info and errors with Winston.
- **Port:** Make sure your service listens on the port defined by the `PORT` env variable.

---

## Summary

- **Syncs library bookings to Microsoft/Adobe license assignment and management.**
- **Runs scheduled via node-cron.**
- **Easy deployment on Render.com using environment variables.**
- **Provides web API for health and manual sync.**

---

**Need help?**  
- Contact your Azure AD/LibCal administrator for API credentials.
- Reach out to Render support for deployment issues.
- Ask here for more technical details or troubleshooting!
