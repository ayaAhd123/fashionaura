import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getAuthToken } from './authStorage';

window.Pusher = Pusher;

let echoInstance = null;

function apiBaseUrl() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  return apiUrl.replace(/\/api\/?$/, '');
}

export function getEcho() {
  const token = getAuthToken();
  const key = import.meta.env.VITE_REVERB_APP_KEY;

  if (!token || !key) return null;

  if (!echoInstance) {
    const scheme = import.meta.env.VITE_REVERB_SCHEME || 'http';
    const port = import.meta.env.VITE_REVERB_PORT || 8080;

    echoInstance = new Echo({
      broadcaster: 'reverb',
      key,
      wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
      wsPort: port,
      wssPort: port,
      forceTLS: scheme === 'https',
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${apiBaseUrl()}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }

  return echoInstance;
}

export function disconnectEcho() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}
