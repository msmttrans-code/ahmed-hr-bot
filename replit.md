# WhatsApp HR Bot

## Overview
A WhatsApp chatbot for HR services that handles employee leave and salary advance requests in both Arabic and English. The bot integrates with Google Sheets via SheetBest API for data storage and includes a manager notification system.

## Features
- **Bilingual Support**: Automatic language detection (Arabic & English) with full support for both languages
- **Arabic Number Support**: Accepts both Arabic-Indic numerals (٠-٩) and standard numerals (0-9)
- **Leave Requests**: Multi-step flow for annual, sick, and emergency leave requests
- **Salary Advance Requests**: Request processing with amount validation
- **Manager Notifications**: Automatic forwarding of requests to designated managers
- **Google Sheets Integration**: All requests stored via SheetBest API with language tracking
- **Persistent Language Context**: Maintains user's preferred language throughout the conversation

## Tech Stack
- **Backend**: Node.js with Express.js
- **API Integration**: WhatsApp Business API (Graph API v18.0)
- **Data Storage**: Google Sheets via SheetBest API
- **Dependencies**: express, body-parser, node-fetch

## Project Structure
```
├── server.js          # Main application server
├── package.json       # Dependencies and scripts
├── .env              # Environment variables (not committed)
└── replit.md         # Project documentation
```

## Environment Variables
- `WHATSAPP_TOKEN`: WhatsApp Business API access token
- `WHATSAPP_PHONE_ID`: WhatsApp phone number ID
- `PORT`: Server port (default: 3000)

## SheetBest API
The bot uses SheetBest API endpoint:
`https://api.sheetbest.com/sheets/29141f75-91aa-4f61-81b7-7a42dc755e94`

## Recent Changes
- **2025-10-20**: Added bilingual support (Arabic & English)
  - Implemented automatic language detection system
  - Created comprehensive bilingual message templates
  - Added Arabic-Indic numeral normalization (٠-٩ → 0-9)
  - Updated all flows to support both languages dynamically
  - Added language field to Google Sheets data for tracking
  - Ensured language persistence throughout conversations

- **2025-10-20**: Initial project setup with complete HR bot implementation
  - Created server.js with webhook handlers
  - Implemented conversation state management
  - Added leave and salary advance request flows
  - Integrated SheetBest API for Google Sheets storage
  - Added manager notification system
  - Configured for deployment on port 3000

## User Preferences
- Bilingual interface (Arabic & English)
- Simple, conversational flow
- Real-time request tracking with unique IDs
- Support for both Arabic-Indic and standard numerals

## How to Setup
1. Get WhatsApp Business API credentials from Meta for Developers
2. Create a Google Sheet and connect it to SheetBest
3. Set environment variables: WHATSAPP_TOKEN and WHATSAPP_PHONE_ID
4. Configure webhook URL in WhatsApp Business settings
5. Update managers mapping in server.js if needed
6. Run the server

## Manager Mapping
Edit the `managers` object in server.js to map employee numbers to their managers:
```javascript
const managers = {
  "employee_number": "manager_number"
};
```
