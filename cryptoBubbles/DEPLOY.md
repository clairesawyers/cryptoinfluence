# Deploying to Vercel

## Quick Deploy

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via CLI**:
   ```bash
   cd cryptoBubbles
   vercel
   ```
   Follow the prompts to link to your Vercel account.

3. **Or deploy via GitHub**:
   - Push your code to GitHub
   - Import the repository on [vercel.com](https://vercel.com)
   - Select the `cryptoBubbles` directory as the root directory

## Environment Variables

Add these in Vercel Dashboard → Project Settings → Environment Variables:

```
VITE_CONTENT_ITEMS_AIRTABLE_BASE_ID=your_base_id
VITE_CONTENT_ITEMS_AIRTABLE_API_KEY=your_api_key
VITE_CONTENT_ITEMS_AIRTABLE_TABLE_ID=your_table_id
VITE_INSTRUMENTS_AIRTABLE_BASE_ID=your_base_id
VITE_INSTRUMENTS_AIRTABLE_API_KEY=your_api_key
VITE_INSTRUMENTS_AIRTABLE_TABLE_ID=your_table_id
VITE_PRICE_HISTORY_AIRTABLE_BASE_ID=your_base_id
VITE_PRICE_HISTORY_AIRTABLE_API_KEY=your_api_key
VITE_PRICE_HISTORY_AIRTABLE_TABLE_ID=your_table_id
VITE_COINMARKETCAP_API_KEY=your_api_key
```

## Build Settings

These are auto-detected, but if needed:
- **Framework Preset**: Vite
- **Root Directory**: `cryptoBubbles`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## Domain Setup

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Post-Deployment

- Check the deployment logs for any errors
- Test all API integrations
- Verify environment variables are working

The app is now ready for production at your Vercel URL!