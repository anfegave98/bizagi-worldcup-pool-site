export const environment = {
  production: false,
  apiUrl: 'http://localhost:5277/api/v1',
  encryption: {
    enabled: true,
    key: '6@t8I4qQ9aSiOJvvn!y&EW&o%1D4YuDY', // 32 chars → AES-256
    iv: 'Y!KQm3%gCO&Me8!U', // Exactamente 16 chars → 128-bit IV
  },
};
