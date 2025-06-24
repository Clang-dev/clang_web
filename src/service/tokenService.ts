export const saveTokens = async (accessToken: string, refreshToken: string) => {
  try {
    localStorage.setItem(
      'auth_tokens',
      JSON.stringify({
        access_token: accessToken,
        refresh_token: refreshToken,
      }),
    );
  } catch (error) {
    console.log('Error saving tokens:', error);
  }
};

export const getTokens = async () => {
  try {
    const tokens = localStorage.getItem('auth_tokens');
    return tokens ? JSON.parse(tokens) : null;
  } catch (error) {
    console.log('Error retrieving tokens:', error);
    return null;
  }
};

export const removeTokens = async () => {
  try {
    localStorage.removeItem('auth_tokens');
  } catch (error) {
    console.log('Error removing tokens:', error);
  }
};