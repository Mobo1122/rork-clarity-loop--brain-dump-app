# Loops - Local Development Setup

This guide will help you run the Loops app locally after migrating from Rork.

## Prerequisites

- Node.js 18+ (or Bun)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac only) or Android Emulator
- Expo Go app (for testing on physical devices)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your Supabase and RevenueCat credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_REVENUECAT_API_KEY=your-revenuecat-key
```

### 3. Run the App

**Option A: Run backend and frontend together (recommended)**

```bash
npm run dev
```

This starts both:
- Backend API on `http://localhost:8081`
- Expo development server

**Option B: Run separately**

Terminal 1 (Backend):
```bash
npm run backend
```

Terminal 2 (Frontend):
```bash
npm start
```

### 4. Open the App

- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on your phone

## Project Structure

```
├── app/                  # Expo Router screens
│   ├── (tabs)/          # Tab navigation screens
│   └── auth/            # Authentication screens
├── components/          # Reusable React components
├── backend/             # Node.js backend (Hono + tRPC)
│   ├── hono.ts         # Hono server setup
│   ├── server.ts       # Development server
│   └── trpc/           # tRPC routes
├── constants/          # App constants (colors, etc.)
├── context/            # React Context providers
├── lib/                # Utility libraries
└── utils/              # Helper functions
```

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Start on Android
- `npm run ios` - Start on iOS
- `npm run web` - Start web version
- `npm run backend` - Start backend API only
- `npm run dev` - Run backend + frontend concurrently
- `npm run lint` - Run ESLint

## Backend API

The backend uses:
- **Hono** - Lightweight web framework
- **tRPC** - Type-safe API
- **Supabase** - Database and authentication

Backend endpoints:
- Health check: `http://localhost:8081/`
- tRPC endpoint: `http://localhost:8081/api/trpc`

## Testing on Physical Devices

The app auto-detects your development machine's IP address. Make sure:
1. Your phone and computer are on the same WiFi network
2. Firewall allows connections on port 8081

If the backend connection fails, you can set a manual API URL in `.env`:
```env
EXPO_PUBLIC_API_BASE_URL=http://YOUR-COMPUTER-IP:8081
```

## Troubleshooting

### "Cannot determine Expo SDK version"

Run:
```bash
npm install expo --save-exact
```

### Backend not connecting

1. Check backend is running: `curl http://localhost:8081`
2. Check your IP: On Mac run `ipconfig getifaddr en0`
3. Try setting `EXPO_PUBLIC_API_BASE_URL` manually

### Module not found errors

Clear caches:
```bash
npm start -- --clear
```

## Production Deployment

### Backend

Deploy your backend to:
- **Vercel** - Easiest for Hono apps
- **Railway** - Simple Node.js hosting
- **Fly.io** - Global edge deployment
- **AWS Lambda** - Serverless option

Then set your production URL:
```env
EXPO_PUBLIC_API_BASE_URL=https://your-backend.vercel.app
```

### Frontend

Build and submit to app stores:

```bash
# iOS
eas build --platform ios
eas submit --platform ios

# Android
eas build --platform android
eas submit --platform android
```

## Migration Notes

This app was migrated from Rork. Changes made:
- ✅ Removed `@rork-ai/toolkit-sdk` dependency
- ✅ Updated start scripts to use standard Expo CLI
- ✅ Created local backend server (`backend/server.ts`)
- ✅ Updated tRPC config for local development
- ✅ Changed bundle IDs from `app.rork.*` to `com.loops.app`
- ✅ Updated app scheme from `rork-app` to `loops`

## Need Help?

- [Expo Documentation](https://docs.expo.dev/)
- [tRPC Documentation](https://trpc.io/)
- [Hono Documentation](https://hono.dev/)
- [Supabase Documentation](https://supabase.com/docs)
