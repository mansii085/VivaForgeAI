import { config, connectDB } from './config/index.js';
import app from './app.js';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    app.listen(config.port, () => {
      console.log(`
╔══════════════════════════════════════════════════╗
║     🚀 AI Career Coach API Server               ║
║──────────────────────────────────────────────────║
║  Port:        ${String(config.port).padEnd(35)}║
║  Environment: ${config.nodeEnv.padEnd(35)}║
║  Client URL:  ${config.clientUrl.padEnd(35)}║
╚══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
