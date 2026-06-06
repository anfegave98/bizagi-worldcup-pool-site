export const environment = {
  production: true,
  apiUrl: 'https://REPLACE_WITH_BACKEND_HOST/api/v1',
  encryption: {
    enabled: true,
    key: '6@t8I4qQ9aSiOJvvn!y&EW&o%1D4YuDY', // 32 chars → AES-256
    iv: 'Y!KQm3%gCO&Me8!U', // Reemplazar antes del build productivo
  },
};
