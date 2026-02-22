# Facebook Messenger AI Chatbot

## Overview
A Facebook Messenger chatbot powered by OpenRouter AI models. Supports multiple Facebook Pages (up to 15) simultaneously and WhatsApp integration via device linking. Users message your Facebook Pages or WhatsApp and receive AI-generated responses automatically. The dashboard allows dynamic configuration of AI text models, image generation services, Facebook Page management, and WhatsApp connection.

## Architecture
- **Backend**: Express server with webhook routes for Facebook Messenger + WhatsApp via Baileys
- **Frontend**: React dashboard for bot configuration and monitoring
- **AI**: OpenRouter API (configurable model, default: stepfun/step-3.5-flash:free)
- **Storage**: In-memory storage for bot configuration (PageConfig array for multi-page support)
- **WhatsApp**: Baileys library for WhatsApp Web multi-device connection with pairing code/QR code authentication

## Key Routes
- `GET /webhook` - Facebook webhook verification (uses stored verify token)
- `POST /webhook` - Receives and processes incoming messages (routes to correct page token via entry.id)
- `GET /api/status` - Returns configuration status including pagesCount and whatsappConnected
- `GET /api/config` - Returns current bot configuration (masked API keys/tokens)
- `GET /api/pages` - List all connected Facebook Pages (masked tokens)
- `POST /api/pages` - Add a new Facebook Page (validates token with Graph API, max 15)
- `DELETE /api/pages/:id` - Remove a connected Facebook Page
- `POST /api/config/ai` - Update AI text model configuration (API key + model)
- `POST /api/config/image` - Update image generation configuration (API key + URL + model)
- `POST /api/config/verify-token` - Update Verify Token dynamically
- `POST /api/whatsapp/connect` - Start WhatsApp linking (accepts phoneNumber, returns pairing code)
- `POST /api/whatsapp/disconnect` - Disconnect WhatsApp session
- `GET /api/whatsapp/status` - Get current WhatsApp connection status (status, pairingCode, qrCode, etc.)
- `POST /api/whatsapp/verify` - Verify if WhatsApp connection is established

## Dashboard Features
- Configuration status cards (Verify Token, Facebook Pages count, OpenRouter Key, WhatsApp status)
- Webhook URL display with copy button
- Facebook Credentials panel (blue gradient header, multi-page management with add/remove, counter badge X/15, Verify Token config, Live/Secured badges)
- WhatsApp Connection panel (green gradient header, phone number input, pairing code display, QR code display, verify button, connection status)
- AI Text Model configuration (change OpenRouter API key and model dynamically)
- Image Generation configuration (generic - supports any image API provider)
- Setup guide with step-by-step Facebook integration instructions

## Environment Variables (Secrets)
- `OPENROUTER_API_KEY` - Default OpenRouter API key (can be overridden from dashboard)
- `PAGE_ACCESS_TOKEN` - Default Facebook Page Access Token (auto-added as first page on startup)
- `VERIFY_TOKEN` - Custom verification token for webhook setup
- `SESSION_SECRET` - Express session secret

## Project Structure
- `server/routes.ts` - Webhook routes + OpenRouter/Facebook API integration + config/pages/whatsapp endpoints
- `server/storage.ts` - In-memory bot configuration storage with multi-page support
- `server/whatsapp.ts` - WhatsApp service module (Baileys connection, pairing code/QR, message handling)
- `shared/schema.ts` - Data schemas and types
- `client/src/pages/dashboard.tsx` - Configuration dashboard with multi-page + WhatsApp management
- `client/src/App.tsx` - App router

## Running
The app runs via `npm run dev` on port 5000 (Replit default). The webhook URL for Facebook is the published app URL + `/webhook`.
