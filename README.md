# CryptoBubble Interface

A canvas-based bubble visualization interface for the Crypto Influence Platform, designed to display cryptocurrency influencer content in an interactive, visually engaging format.

## Features

- **Canvas-based Bubble Visualization**: Dynamic sizing of video cards based on view count
- **Spiral Layout Algorithm**: Efficient positioning of video cards in a visually appealing spiral pattern
- **Interactive Card Selection**: Click to select and view detailed information about specific content
- **Date Navigation**: Filter content by day, week, or month views
- **Dark Mode Styling**: Comprehensive dark mode with 3D shadows and gradient backgrounds
- **Responsive Design**: Works across various screen sizes and devices

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Data Fetching**: Axios for Airtable API integration
- **Build Tool**: Vite
- **Deployment**: Heroku with Express server

## Architecture

The CryptoBubble interface is built with a component-based architecture:

- `CryptoBubbleInterface`: Main component managing state and canvas rendering
- `BubbleCard`: Canvas rendering utility for video cards
- `BubbleHeader`: Navigation header with links
- `BubbleControls`: Date and view mode navigation
- Utility functions in `bubbleUtils.ts` for spiral positioning, card sizing, and date filtering

## Design System

The implementation follows the CryptoVibes Design System with:

- Custom colour palette with primary purple spectrum
- 3D card and button styles with enhanced shadows
- Custom typography with Silkscreen, Space Grotesk, and Inter fonts
- Gradient backgrounds and interactive hover states

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

- `src/components` - React components including CryptoBubbleInterface and BubbleCard
- `src/services` - API services for Airtable integration
- `src/types` - TypeScript interfaces
- `src/utils` - Utility functions including bubbleUtils for canvas rendering
- `src/hooks` - Custom hooks for mobile detection and toast notifications
- `src/styles` - Design system CSS variables and global styles

## Deployment

The application is deployed to Heroku as a static Vite build served by an Express server:

1. Build the application with `npm run build`
2. The Express server serves the static files from the `dist` directory
3. The server is configured to handle client-side routing by serving `index.html` for all routes

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Technical Architecture

For a detailed overview of the technical architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Future Enhancements

- Advanced filtering by cryptocurrency type
- Performance optimizations for large datasets
- Animation and transition effects
- Integration with additional data sources
- Real-time updates for new content
