export const persistSession = ({ token, user }) => {
  if (token) localStorage.setItem('token', token);
  if (user) localStorage.setItem('user', JSON.stringify(user));
};

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

export const isPhoneOnlyAccount = (user) => Boolean(
  user?.phone && typeof user?.email === 'string' && user.email.endsWith('@phone.local')
);
