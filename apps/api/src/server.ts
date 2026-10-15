import { app } from './app.js';
import { env } from './config/env.js';

const server = app.listen(env.PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 ${env.APP_NAME} Backend API running`);
  console.log(`📡 URL: http://localhost:${env.PORT}${env.API_PREFIX}`);
  console.log(`🔒 Security: Helmet, CORS, Rate-Limiter enabled`);
  console.log(`🤖 AI Engine: ${env.GEMINI_MODEL}`);
  console.log(`🌐 Search Provider: ${env.SEARCH_PROVIDER}`);
  console.log(`=======================================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
