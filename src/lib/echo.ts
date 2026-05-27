// eslint-disable-next-line @typescript-eslint/no-explicit-any
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Echo: any;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let echo: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getEcho(token: string): any {
  if (echo) return echo;

  if (typeof window !== 'undefined') {
    window.Pusher = Pusher;
  }

  echo = new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY!,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? 'localhost',
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  });

  return echo;
}

export function destroyEcho(): void {
  echo?.disconnect();
  echo = null;
}
