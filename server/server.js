import app from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { initMailer } from './src/config/mailer.js';
import { initCronJobs } from './src/jobs/cronScheduler.js';

let server;

/**
 * Bootstrap and start the backend HTTP server
 */
const startServer = async () => {
  try {
    // 1. Establish Database Connection
    await connectDB();

    // 2. Initialize Nodemailer Transporter
    await initMailer();

    // 3. Register Background Cron Schedulers
    initCronJobs();

    // 4. Start HTTP Listener
    server = app.listen(env.PORT, () => {
      console.log(`\n======================================================`);
      console.log(` TalentPulse Backend Server Started`);
      console.log(` Environment:  ${env.NODE_ENV}`);
      console.log(` Port:         ${env.PORT}`);
      console.log(` Base URL:     http://localhost:${env.PORT}`);
      console.log(` Health Check: http://localhost:${env.PORT}${env.API_PREFIX}/health`);
      console.log(`======================================================\n`);
    });
  } catch (error) {
    console.error('[Fatal] Server failed to start:', error);
    process.exit(1);
  }
};


/**
 * Graceful shutdown handler
 */
const handleShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      await disconnectDB();
      console.log('[Server] Graceful shutdown complete. Exiting process.');
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }

  // Force shutdown after timeout if pending connections hang
  setTimeout(() => {
    console.error('[Server] Force shutdown timeout exceeded. Exiting.');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection] at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Uncaught Exception] caught:', error);
  process.exit(1);
});

// Launch server
startServer();
