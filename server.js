const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Load build info
let buildInfo = {};
try {
  const buildInfoPath = path.join(__dirname, 'build-info.json');
  buildInfo = JSON.parse(fs.readFileSync(buildInfoPath, 'utf8'));
  console.log('📋 Build Info loaded:', buildInfo);
} catch (error) {
  console.warn('⚠️  Could not load build-info.json:', error.message);
  buildInfo = {
    environment: 'unknown',
    buildMode: 'unknown',
    analyticsEnabled: false,
    apiVersion: 'unknown',
    buildDate: new Date().toISOString(),
    gitCommit: 'unknown'
  };
}

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Docker Build with Parameters Demo',
    buildInfo: buildInfo,
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    environment: buildInfo.environment,
    uptime: process.uptime()
  });
});

app.get('/info', (req, res) => {
  res.json({
    buildInfo: buildInfo,
    runtime: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    }
  });
});

app.get('/api/version', (req, res) => {
  res.json({
    version: buildInfo.apiVersion,
    environment: buildInfo.environment,
    buildDate: buildInfo.buildDate
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: buildInfo.buildMode === 'debug' ? err.message : 'An error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${buildInfo.environment}`);
  console.log(`🔧 Build Mode: ${buildInfo.buildMode}`);
  console.log(`📊 Analytics: ${buildInfo.analyticsEnabled ? 'Enabled' : 'Disabled'}`);
  console.log(`📌 API Version: ${buildInfo.apiVersion}`);
  console.log(`📅 Build Date: ${buildInfo.buildDate}`);
  console.log(`🔖 Git Commit: ${buildInfo.gitCommit}`);
  console.log('='.repeat(60));
  console.log('\nAvailable endpoints:');
  console.log('  GET /        - Welcome message');
  console.log('  GET /health  - Health check');
  console.log('  GET /info    - Detailed information');
  console.log('  GET /api/version - API version');
  console.log('='.repeat(60));
});
