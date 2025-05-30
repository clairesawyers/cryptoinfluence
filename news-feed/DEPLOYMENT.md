# Deployment Guide for CryptoBubble Interface

This document provides detailed instructions for deploying the CryptoBubble interface to Heroku.

## Prerequisites

- Heroku CLI installed and authenticated
- Node.js 18.x or later
- npm or yarn package manager
- Git

## Deployment Steps

### 1. Prepare the Application for Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Ensure you have the following files in your project root:

   - **server.js**: Express server to serve static files
   ```javascript
   const express = require('express');
   const path = require('path');

   const app = express();
   const PORT = process.env.PORT || 5000;

   app.use(express.static(path.join(__dirname, 'dist')));

   app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, 'dist', 'index.html'));
   });

   app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
   });
   ```

   - **package.json**: Configuration for Node.js
   ```json
   {
     "name": "crypto-bubble-interface",
     "version": "1.0.0",
     "scripts": {
       "start": "node server.js",
       "build": "vite build"
     },
     "dependencies": {
       "express": "^4.18.2"
     },
     "engines": {
       "node": "18.x"
     }
   }
   ```

   - **Procfile**: Instructions for Heroku
   ```
   web: node server.js
   ```

   - **static.json**: Configuration for static site hosting
   ```json
   {
     "root": "dist",
     "clean_urls": true,
     "routes": {
       "/": "index.html",
       "/*": "index.html"
     }
   }
   ```

### 2. Create a New Heroku App

```bash
heroku create crypto-bubble-interface
```

### 3. Set Buildpacks

```bash
heroku buildpacks:set heroku/nodejs
```

### 4. Deploy to Heroku

```bash
git add .
git commit -m "Prepare for Heroku deployment"
git push heroku main
```

### 5. Scale the Dyno

```bash
heroku ps:scale web=1
```

### 6. Open the App

```bash
heroku open
```

## Troubleshooting

### Common Issues and Solutions

1. **Application Error or Crashed State**:
   - Check logs: `heroku logs -a <app-name>`
   - Look for syntax errors or missing dependencies
   - Ensure the server.js file uses CommonJS syntax (not ES modules)

2. **Missing Dependencies**:
   - Ensure express is listed in dependencies (not devDependencies)
   - Check that the Node.js version is specified in engines

3. **Routing Issues**:
   - Verify that the server.js file correctly serves the index.html for all routes
   - Check that the static.json file has the correct routing configuration

4. **Build Failures**:
   - Ensure the build process completes successfully locally before deploying
   - Check for any environment variables needed for the build process

## Monitoring and Maintenance

- **View Logs**: `heroku logs -a <app-name> --tail`
- **Restart App**: `heroku restart -a <app-name>`
- **Check Status**: `heroku ps -a <app-name>`

## Security Considerations

- Do not commit sensitive information to the repository
- Use environment variables for any API keys or secrets
- Set up proper CORS headers if connecting to external APIs

## Performance Optimization

- Enable gzip compression in Express
- Implement proper caching headers
- Consider using a CDN for static assets
