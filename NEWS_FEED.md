# Crypto Influences News Feed Documentation

## Overview

The Crypto Influences News Feed is a mobile-first React application that displays cryptocurrency influencer content from an Airtable database. The feed provides a streamlined interface for users to browse, filter, and sort content from various crypto influencers across multiple platforms.

## Features

- **Infinite Scroll Feed**: Dynamically loads more content as the user scrolls
- **Video Cards**: Displays video thumbnails, titles, and engagement metrics
- **Filtering System**: Filter content by influencer platform
- **Sorting Options**: Sort by newest, oldest, or most viewed
- **Loading States**: Placeholder cards with pulsing animation
- **Error Handling**: Comprehensive error states and user feedback
- **Empty State UI**: Clear messaging when no content matches filters
- **Mobile-First Design**: Responsive layout optimized for mobile devices

## Architecture

The News Feed is built as a standalone React application that integrates with the Airtable API to fetch and display cryptocurrency influencer content.

### Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **API Integration**: Axios
- **Icons**: Lucide React
- **Build Tool**: Vite

### Project Structure

```
crypto-influences-news-feed/
├── src/
│   ├── app/
│   │   └── App.tsx           # Main application component
│   ├── components/
│   │   ├── CryptoInfluencesFeed.tsx  # Main feed component
│   │   ├── VideoCard.tsx             # Video card component
│   │   └── PlaceholderCard.tsx       # Loading state component
│   ├── services/
│   │   └── airtable.ts       # Airtable API integration
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles
├── public/                   # Static assets
└── tailwind.config.js        # Tailwind configuration
```

## Integration Points

### Airtable Integration

The News Feed integrates with Airtable to fetch cryptocurrency influencer content. The integration uses the following configuration:

- **Base ID**: Configured via environment variables
- **Table ID**: Configured via environment variables
- **Authentication**: Bearer token using an Airtable API key stored in environment variables

The Airtable table contains the following key fields:

- **Title**: Video title
- **Thumbnail**: Video thumbnail URL
- **Length (Seconds)**: Video duration
- **Publish Date**: When the video was published
- **Views Count**: Number of views
- **Likes Count**: Number of likes
- **Platform**: Influencer platform (YouTube, Twitter, etc.)
- **Influencer Name**: Name of the influencer
- **Influencer Icon**: Profile image URL for the influencer
- **Influencer_Relation**: Relation to the influencer record

### Database Integration

The News Feed will integrate with the Crypto Influences database as described in [DATABASE.md](DATABASE.md) in a future phase. Key integration points will include:

- **content_items**: For displaying content in the feed
- **influencers**: For displaying influencer information
- **instruments**: For displaying mentioned financial instruments

## Deployment

The News Feed is deployed to Heroku as a static Vite build.

### Deployment Process

1. Build the React application with `npm run build`
2. Use the `static.json` file to configure the static site
3. Deploy to Heroku using the Heroku CLI or GitHub integration

## Local Development

### Prerequisites

- Node.js 18+ and npm
- Airtable API key

### Setup Instructions

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

## Future Enhancements

- User authentication and personalized feeds
- Integration with the main Crypto Influences database
- Advanced filtering and search capabilities
- Real-time updates for new content
- Engagement metrics and analytics
- Integration with the Admin Console for content management
