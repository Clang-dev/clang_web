import { getTokens, saveTokens, removeTokens } from './tokenService';

const BACKEND_URL = 'https://clang-a3xo.onrender.com';

const refreshAccessToken = async () => {
  const tokens = await getTokens();
  if (!tokens || !tokens.refresh_token) {
    console.log('No refresh token found. Logging out...');
    return null;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/0.1.0/auth/refresh_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: tokens.refresh_token }),
    });

    if (!response.ok) {
      console.log('Refresh failed. Logging out...');
      return null;
    }
    const data = await response.json();
    await saveTokens(data.access_token, tokens.refresh_token);
    return data.access_token;
  } catch (error) {
    console.log('Error refreshing token:', error);
    return null;
  }
};

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  let tokens = await getTokens();
  if (!tokens) {
    console.log('No tokens found. Redirecting to login...');
    return null;
  }

  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${tokens.access_token}`,
    },
  });

  if (response.status === 401 || response.status === 403) {
    console.log('Access token expired. Refreshing...');

    const newAccessToken = await refreshAccessToken();
    if (!newAccessToken) {
      console.log('Refresh failed. Logging out...');
      await removeTokens();
      return null;
    }

    response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${newAccessToken}`,
      },
    });
  }

  return response;
};

export const signUp = async (
  username: string,
  email: string,
  password: string,
) => {
  const response = await fetch(`${BACKEND_URL}/0.1.0/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });

  return response;
};

export const sendCode = async (email: string) => {
  const response = await fetch(`${BACKEND_URL}/0.1.0/auth/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  return response;
};

export const verifyCode = async (email: string, code: string) => {
  const response = await fetch(`${BACKEND_URL}/0.1.0/auth/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code: parseInt(code, 10) }),
  });

  return response;
};

export const login = async (email: string, password: string) => {
  const response = await fetch(`${BACKEND_URL}/0.1.0/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  console.log(data.access_token);
  await saveTokens(data.access_token, data.refresh_token);

  return [response, data];
};

export const me = async () => {
  const response = await fetchWithAuth(`${BACKEND_URL}/0.1.0/auth/me`);
  return response;
};

export const getRooms = async () => {
  const response = await fetchWithAuth(
    `${BACKEND_URL}/0.1.0/classroom/active`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  if (!response) {
    throw new Error('Failed to fetch data');
  }
  const data = await response.json();

  return data;
};

export const createClassroom = async (
  roomName: string,
  selectedLanguage: string,
) => {
  const response = await fetchWithAuth(`${BACKEND_URL}/0.1.0/classroom/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: roomName,
      language: selectedLanguage.trim().endsWith('English') ? 'en' : 'ko',
    }),
  });
  if (!response) {
    throw new Error('Failed to fetch data');
  }
  return response;
};

export const getClassroom = async (room_id: string) => {
  const response = await fetchWithAuth(
    `${BACKEND_URL}/0.1.0/classroom/${room_id}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  if (!response) {
    throw new Error('Failed to fetch data');
  }
  const data = await response.json();

  return data;
};

export const saveTranscript = async (
  transcription: string,
  classroom_uid: string,
) => {
  const response = await fetchWithAuth(
    `${BACKEND_URL}/0.1.0/transcriptions/classroom/${classroom_uid}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcripted_text: transcription,
      }),
    },
  );
  if (!response) {
    throw new Error('Failed to fetch data');
  }
  return response;
};

export const getTranscript = async (room_id: string) => {
  const response = await fetchWithAuth(
    `${BACKEND_URL}/0.1.0/transcriptions/classroom/${room_id}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  if (!response) {
    throw new Error('Failed to fetch data');
  }
  const data = await response.json();

  return data;
};