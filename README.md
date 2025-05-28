# Crypto Influence

A comprehensive platform for tracking and analyzing cryptocurrency influencers and their impact on the market.

## Database Structure

The application uses a Heroku PostgreSQL database (Essential-0 plan) with a comprehensive schema designed to track:

- Crypto influencers across multiple platforms (YouTube, Twitter, TikTok, Telegram)
- Content items (videos, tweets, posts) with engagement metrics
- Mentions of financial instruments with AI-assisted extraction
- Performance metrics and analytics with historical tracking
- User portfolios and simulations with different time horizons

For detailed database documentation, see [DATABASE.md](DATABASE.md).

### Database Quick Facts

- **Platform**: Heroku PostgreSQL (Essential-0 plan)
- **Tables**: 17 core and analytical tables
- **Views**: 8 analytical views for common queries
- **Initial Data**: Pre-populated with system settings and instruments

## Admin Console

The Crypto Influences Admin Console provides a web-based interface for reviewing and managing AI-extracted cryptocurrency mentions from YouTube videos. Key features include:

- Review queue with filtering and search
- Content review interface
- Mention editing and approval workflow
- Video submission with webhook integration

For detailed admin console documentation, see [ADMIN.md](ADMIN.md).

## Getting Started

### Prerequisites

- PostgreSQL client for database access
- Connection details for the Heroku PostgreSQL instance

### Database Connection

The database is hosted on Heroku PostgreSQL. Connection details are available to authorized team members.

## Features

- Multi-platform influencer tracking (YouTube, Twitter, TikTok, Telegram)
- AI-assisted mention extraction with human review workflows
- Comprehensive performance tracking with different time horizons
- User portfolio simulations and analytics
