# Crypto Influence Database Documentation

## Overview

The Crypto Influence database is designed to track cryptocurrency influencers, their content across multiple platforms, mentions of financial instruments, and performance metrics. The database is hosted on Heroku PostgreSQL.

## Database Setup

- **Platform**: Heroku PostgreSQL (Essential-0 plan)
- **App Name**: crypto-influence-db

Database connection details are available to authorized team members through secure channels.

## Schema Structure

### Core Tables

1. **users** - Application users with authentication and permission details
2. **influencers** - Crypto influencers with platform-specific identifiers and metrics
3. **content_items** - Content published by influencers (videos, tweets, posts)
4. **instruments** - Financial instruments (cryptocurrencies, tokens) being tracked
5. **content_mentions** - Mentions of financial instruments in content items
6. **mention_candidates** - AI-extracted potential mentions pending review
7. **mention_performance** - Performance metrics for mentions over time
8. **price_history** - Historical price data for tracked instruments

### Analytical Tables

1. **influencer_performance_summary** - Aggregated performance metrics for influencers
2. **content_engagement_history** - Historical engagement metrics for content items
3. **influencer_engagement_history** - Historical engagement metrics for influencers
4. **portfolio_simulations** - User-created portfolio simulations
5. **simulation_allocations** - Allocations within portfolio simulations
6. **review_feedback** - Feedback on mention reviews for quality control
7. **ai_processing_logs** - Logs of AI processing operations
8. **api_configurations** - Configuration for external API integrations
9. **system_settings** - System-wide configuration settings

### Views

1. **influencer_leaderboard** - Top influencers by performance metrics
2. **content_pending_review** - Content items pending review
3. **mention_candidates_pending** - Mention candidates pending review
4. **reviewer_performance** - Performance metrics for reviewers
5. **content_engagement_trends** - Engagement trends for content items
6. **top_performing_mentions** - Top performing mentions by return percentage

## Entity Relationship Diagram

```
users
  ↑
  ↓
influencers ← → influencer_engagement_history
  ↑
  ↓
content_items ← → content_engagement_history
  ↑
  ↓
content_mentions ← → mention_performance
  ↑
  ↓
instruments ← → price_history
  ↑
  ↓
mention_candidates
```

## Key Features

- **Multi-platform Support**: Tracks influencers across YouTube, Twitter, TikTok, and Telegram
- **AI-assisted Processing**: Automated extraction of mentions with human review workflow
- **Performance Tracking**: Comprehensive metrics for influencer and content performance
- **Portfolio Simulation**: User portfolio simulations based on influencer mentions
- **Engagement History**: Historical tracking of engagement metrics over time

## Initial Data

The database is pre-populated with:
- System settings for default configuration
- Initial set of cryptocurrency instruments (BTC, ETH, USDC, USDT)

## Access and Security

Database access is restricted to authorized users with proper credentials. Connection details are available to team members with appropriate permissions.

For security reasons, always use environment variables or secure credential storage when connecting to the database in application code. Never hardcode database credentials in source files.

## Schema Maintenance

The full SQL schema is available in the [SCHEMA.sql](SCHEMA.sql) file for reference and maintenance purposes.
