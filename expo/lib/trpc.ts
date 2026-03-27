import { httpLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";
import Constants from "expo-constants";

import type { AppRouter } from "@/backend/trpc/app-router";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // In production, use your deployed backend URL
  const productionUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (productionUrl) {
    return productionUrl;
  }

  // For local development
  // Use your computer's local IP for testing on physical devices
  // or localhost for web/simulator
  const localhost = Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost';
  const port = process.env.EXPO_PUBLIC_API_PORT || '8081';

  return `http://${localhost}:${port}`;
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
