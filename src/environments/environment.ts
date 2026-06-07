export const environment = {
  production: false,
  apiUrl: 'http://localhost:5277/api/v1',
  encryption: {
    enabled: true,
    key: 'gOxokGUU1PD+0Zp52tMjHif70MF8nR1ameX0inQg7Ck=',  // Base64 de 32 bytes — AES-256
    iv:  'p76iDDQAhbdUXmgRcthukQ==',                        // Base64 de 16 bytes — 128-bit IV
  }
};
