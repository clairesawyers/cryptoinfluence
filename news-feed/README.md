# Crypto Influences News Feed

Mobile-first feed component for displaying cryptocurrency influencer content from Airtable.

## Features

- Infinite scroll feed with video cards
- Filter by influencer platform
- Sort by newest, oldest, and most viewed
- Loading states with placeholder cards
- Error handling and empty state UI
- Mobile-first responsive design

## Tech Stack

- React 18 with TypeScript
- Tailwind CSS for styling
- Axios for API requests
- Lucide React for icons
- Vite for build tooling

## Local Development

1. Clone the repository
```bash
git clone https://github.com/clairesawyers/cryptoinfluence.git
cd cryptoinfluence/news-feed
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file with your Airtable API key
```bash
cp .env.example .env
# Edit .env to add your Airtable API key
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

- `src/components` - React components including VideoCard and CryptoInfluencesFeed
- `src/services` - API services for Airtable integration
- `src/types` - TypeScript interfaces
- `src/app` - Main application component
- `src/index.css` - Global styles and Tailwind imports

## Deployment

The application is deployed to Heroku as a static Vite build.

## Future Enhancements

- User authentication and personalized feeds
- Integration with the main Crypto Influences database
- Advanced filtering and search capabilities
- Real-time updates for new content
