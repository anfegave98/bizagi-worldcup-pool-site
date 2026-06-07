const fs = require('fs');

const content = `export const environment = {
  production: true,
  apiUrl: '${process.env.API_URL}',
  encryption: {
    enabled: true,
    key: '${process.env.ENCRYPTION_KEY}',
    iv: '${process.env.ENCRYPTION_IV}'
  }
};
`;

fs.mkdirSync('src/environments', { recursive: true });
fs.writeFileSync('src/environments/environment.production.ts', content);

console.log('environment.production.ts generado');