# Crypto Influences Admin Console

## Overview

The Crypto Influences Admin Console is a web-based interface for reviewing and managing AI-extracted cryptocurrency mentions from YouTube videos. The admin system provides a streamlined workflow for content reviewers to approve, reject, or modify mentions identified by the AI system.

## Features

- **Review Queue**: A comprehensive list of content items awaiting review with filtering and search capabilities
- **Content Review Interface**: Detailed view for reviewing individual content items
- **Mention Review System**: Edit, approve, or reject AI-extracted mentions
- **Video Submission**: Add new YouTube videos for AI processing via webhook integration
- **Real-time Updates**: Dynamic UI updates using React Query

## Architecture

The Admin Console is built as a standalone Next.js application that integrates with the main Crypto Influences platform through API endpoints and webhooks.

### Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **UI Components**: Custom components with Lucide React icons
- **Deployment**: Heroku static site hosting

### Project Structure

```
crypto-influences-admin/
├── src/
│   ├── app/                  # Next.js app router pages
│   │   ├── admin/            # Admin routes
│   │   │   ├── content/[id]/ # Content review page
│   │   │   └── page.tsx      # Main admin dashboard
│   ├── components/
│   │   ├── admin/            # Admin-specific components
│   │   │   ├── AddVideoModal.tsx     # Video submission modal
│   │   │   ├── ContentReview.tsx     # Content review component
│   │   │   ├── MentionReviewCard.tsx # Mention review card
│   │   │   └── ReviewQueue.tsx       # Review queue component
│   │   └── ui/               # Reusable UI components
│   ├── hooks/                # Custom React hooks
│   ├── lib/
│   │   └── api.ts            # API functions and mock data
│   ├── types/                # TypeScript interfaces
│   └── utils/                # Helper functions
├── public/                   # Static assets
└── next.config.js            # Next.js configuration
```

## Integration Points

### Webhook Integration

The Admin Console integrates with the Make.com platform for processing new video submissions. When a user submits a YouTube video URL through the "Add Video" form, the following process occurs:

1. The video URL is validated and the YouTube video ID is extracted
2. A JSON payload is sent to the Make.com webhook endpoint
3. The payload is formatted as a JSON array containing:
   ```json
   [
     {
       "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
       "videoId": "VIDEO_ID",
       "submitTime": "2025-05-28T04:11:43.000Z"
     }
   ]
   ```
4. The webhook endpoint is: `https://hook.us2.make.com/nwaqwkd66lcrlprmipihf2i9qic5yf9b`
5. No authentication is required for the webhook submission

### Database Integration

The Admin Console will integrate with the Crypto Influences database as described in [DATABASE.md](DATABASE.md). Key integration points include:

- **content_items**: For displaying and managing content in the review queue
- **mention_candidates**: For reviewing AI-extracted mentions
- **influencers**: For displaying influencer information
- **instruments**: For displaying and selecting financial instruments

## Deployment

The Admin Console is deployed to Heroku as a static Next.js export.

### Deployment Process

1. Build the Next.js application with `npm run build`
2. Use the `serve` package to serve the static files
3. Configure Heroku to use the `npm start` script which runs `serve -s out`

### Production URL

The Admin Console is accessible at: [https://crypto-influence-app-6604a172b16b.herokuapp.com/](https://crypto-influence-app-6604a172b16b.herokuapp.com/)

## Local Development

### Prerequisites

- Node.js 18+ and npm
- Git

### Setup Instructions

1. Clone the repository
```bash
git clone https://github.com/clairesawyers/crypto-influences-admin.git
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

## Future Enhancements

- User authentication and role-based access control
- Integration with real-time notification systems
- Advanced analytics dashboard for reviewer performance
- Bulk operations for mention processing
- Integration with the main Crypto Influences database
