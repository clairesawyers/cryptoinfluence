# Crypto Influences Admin Console

Admin interface for reviewing AI-extracted crypto mentions from YouTube videos.

## Features

- Review queue with filtering and search
- Individual content review interface
- Mention editing and approval workflow
- Real-time updates using React Query

## Tech Stack

- Next.js 14 with TypeScript
- Tailwind CSS for styling
- React Query for state management
- Lucide React for icons

## Local Development

1. Clone the repository
```bash
git clone https://github.com/your-username/crypto-influences-admin.git
cd crypto-influences-admin
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000/admin](http://localhost:3000/admin) in your browser

## Project Structure

- `src/app` - Next.js app router pages
- `src/components/admin` - Admin-specific components
- `src/components/ui` - Reusable UI components
- `src/hooks` - Custom React hooks
- `src/lib` - API and utility functions
- `src/types` - TypeScript interfaces
- `src/utils` - Helper functions

## Mock Data

The application currently uses mock data for development and testing purposes. The mock data includes:

- YouTube videos with crypto mentions
- Influencer profiles
- Crypto instruments (BTC, ETH, SOL, etc.)
- Sentiment analysis and recommendation types

## Future Integration

Backend integration will be implemented in a future phase to connect with real data sources.
