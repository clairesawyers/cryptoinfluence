

CREATE TABLE influencers (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    display_name VARCHAR(200),
    bio TEXT,
    profile_image_url VARCHAR(500),
    follower_count INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    
    website_url VARCHAR(500),
    twitter_handle VARCHAR(100),
    youtube_channel_id VARCHAR(100),
    tiktok_handle VARCHAR(100),
    telegram_channel VARCHAR(100),
    
    twitter_user_id VARCHAR(50),
    youtube_channel_handle VARCHAR(100),
    tiktok_user_id VARCHAR(50),
    
    total_mentions INTEGER DEFAULT 0,
    performance_score DECIMAL(5,2), -- Weighted performance score
    hit_rate DECIMAL(5,2), -- Percentage of profitable recommendations
    avg_return DECIMAL(8,4), -- Average percentage return
    consistency_score DECIMAL(5,2), -- Standard deviation of returns
    
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
    first_tracked_at TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(username)
);

CREATE INDEX idx_influencers_status ON influencers (status);
CREATE INDEX idx_influencers_performance ON influencers (performance_score DESC);
CREATE INDEX idx_influencers_twitter_id ON influencers (twitter_user_id);
CREATE INDEX idx_influencers_youtube_id ON influencers (youtube_channel_id);

CREATE TABLE content_items (
    id BIGSERIAL PRIMARY KEY,
    influencer_id BIGINT NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
    
    platform VARCHAR(20) NOT NULL, -- 'youtube', 'twitter', 'tiktok', 'telegram'
    platform_content_id VARCHAR(100) NOT NULL, -- Video ID, Tweet ID, etc.
    content_type VARCHAR(20) NOT NULL, -- 'video', 'tweet', 'post', 'story'
    
    title TEXT,
    description TEXT,
    content_text TEXT, -- For tweets, captions, etc.
    thumbnail_url VARCHAR(500),
    content_url VARCHAR(500), -- Direct link to content
    
    transcript TEXT, -- Full transcript from AI
    transcript_language VARCHAR(10) DEFAULT 'en',
    transcript_confidence DECIMAL(3,2), -- AI confidence in transcript (0.00-1.00)
    
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    last_engagement_update TIMESTAMP, -- When these metrics were last updated
    
    duration_seconds INTEGER, -- For videos
    language VARCHAR(10) DEFAULT 'en',
    hashtags JSONB, -- Array of hashtags
    
    workflow_status VARCHAR(30) DEFAULT 'collected', -- collected, transcript_processing, transcript_completed, mention_extraction, mention_review, human_reviewed, published, failed
    is_published BOOLEAN DEFAULT FALSE, -- Published to public library
    
    ai_processing_started_at TIMESTAMP,
    ai_processing_completed_at TIMESTAMP,
    ai_model_version VARCHAR(50), -- Track which AI model was used
    ai_processing_errors JSONB, -- Store any AI processing errors
    
    human_review_required BOOLEAN DEFAULT TRUE,
    human_reviewed_at TIMESTAMP,
    human_reviewer_id BIGINT, -- Reference to users table
    human_review_notes TEXT,
    
    published_at TIMESTAMP NOT NULL,
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_analyzed TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(platform, platform_content_id)
);

CREATE INDEX idx_content_platform ON content_items (platform);
CREATE INDEX idx_content_influencer ON content_items (influencer_id);
CREATE INDEX idx_content_published ON content_items (published_at DESC);
CREATE INDEX idx_content_workflow_status ON content_items (workflow_status);
CREATE INDEX idx_content_human_review ON content_items (human_review_required, human_reviewed_at);
CREATE INDEX idx_content_is_published ON content_items (is_published);
CREATE INDEX idx_content_platform_influencer ON content_items (platform, influencer_id);

CREATE TABLE instruments (
    id BIGSERIAL PRIMARY KEY,
    
    symbol VARCHAR(20) NOT NULL, -- BTC, ETH, AAPL, etc.
    name VARCHAR(200) NOT NULL, -- Bitcoin, Ethereum, Apple Inc.
    instrument_type VARCHAR(20) NOT NULL, -- 'crypto', 'stock', 'etf', 'commodity'
    
    coingecko_id VARCHAR(100), -- For CoinGecko API
    coinmarketcap_id VARCHAR(100), -- For CoinMarketCap API
    contract_address VARCHAR(100), -- For tokens
    blockchain VARCHAR(50), -- ethereum, bsc, polygon, etc.
    
    current_price DECIMAL(20,8),
    market_cap DECIMAL(20,2),
    volume_24h DECIMAL(20,2),
    price_change_24h DECIMAL(8,4), -- Percentage
    
    description TEXT,
    website_url VARCHAR(500),
    logo_url VARCHAR(500),
    category VARCHAR(50), -- DeFi, L1, L2, Meme, etc.
    tags JSONB, -- Array of tags
    
    is_active BOOLEAN DEFAULT TRUE,
    first_tracked TIMESTAMP,
    last_price_update TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(symbol, instrument_type)
);

CREATE INDEX idx_instruments_symbol ON instruments (symbol);
CREATE INDEX idx_instruments_type ON instruments (instrument_type);
CREATE INDEX idx_instruments_coingecko ON instruments (coingecko_id);
CREATE INDEX idx_instruments_active ON instruments (is_active);
CREATE INDEX idx_instruments_market_cap ON instruments (market_cap DESC);


CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url VARCHAR(500),
    
    role VARCHAR(20) DEFAULT 'user', -- user, reviewer, admin, super_admin
    can_review_mentions BOOLEAN DEFAULT FALSE,
    can_publish_content BOOLEAN DEFAULT FALSE,
    review_permissions JSONB, -- Specific review permissions (influencers, categories, etc.)
    
    total_reviews_completed INTEGER DEFAULT 0,
    avg_review_time_minutes DECIMAL(8,2),
    review_accuracy_score DECIMAL(3,2), -- Based on feedback from other reviewers
    
    default_investment_amount DECIMAL(10,2) DEFAULT 100.00,
    preferred_currency VARCHAR(3) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    subscription_tier VARCHAR(20) DEFAULT 'free', -- free, premium, enterprise
    
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_subscription ON users (subscription_tier);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_can_review ON users (can_review_mentions);


CREATE TABLE mention_candidates (
    id BIGSERIAL PRIMARY KEY,
    content_item_id BIGINT NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    
    extracted_text VARCHAR(500) NOT NULL, -- The exact text AI found
    suggested_symbol VARCHAR(20), -- AI's best guess for symbol
    suggested_instrument_id BIGINT REFERENCES instruments(id), -- If AI matched to existing instrument
    
    ai_confidence DECIMAL(3,2) NOT NULL, -- 0.00-1.00, how confident AI is
    mention_type VARCHAR(20) NOT NULL, -- 'ticker_symbol', 'full_name', 'nickname', 'context_clue'
    context_snippet TEXT, -- Surrounding text for human review
    position_in_transcript INTEGER, -- Character position in transcript
    timestamp_in_video INTEGER, -- Seconds into video (if available)
    
    sentiment_score DECIMAL(3,2), -- -1.00 to 1.00 (negative to positive)
    sentiment_label VARCHAR(10), -- 'positive', 'negative', 'neutral'
    is_recommendation BOOLEAN DEFAULT FALSE, -- AI thinks this is a buy/sell rec
    recommendation_type VARCHAR(10), -- 'buy', 'sell', 'hold', 'avoid'
    
    exact_quote TEXT, -- The specific quote mentioning the coin
    quote_classification VARCHAR(30), -- 'price_prediction', 'general_opinion', 'news_mention', 'technical_analysis'
    
    review_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, modified, needs_clarification
    reviewed_at TIMESTAMP,
    reviewed_by BIGINT REFERENCES users(id),
    human_notes TEXT,
    
    approved_instrument_id BIGINT REFERENCES instruments(id), -- Final instrument ID after human review
    approved_symbol VARCHAR(20), -- Final symbol after human review
    approved_as_mention BOOLEAN, -- Whether human approved this as a valid mention
    
    ai_model_used VARCHAR(50), -- Which AI model extracted this
    ai_processing_time_ms INTEGER, -- How long AI took to process
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_candidates_content ON mention_candidates (content_item_id);
CREATE INDEX idx_candidates_review_status ON mention_candidates (review_status);
CREATE INDEX idx_candidates_confidence ON mention_candidates (ai_confidence DESC);
CREATE INDEX idx_candidates_approved ON mention_candidates (approved_as_mention);
CREATE INDEX idx_candidates_instrument ON mention_candidates (suggested_instrument_id);
CREATE INDEX idx_candidates_reviewer ON mention_candidates (reviewed_by);


CREATE TABLE content_mentions (
    id BIGSERIAL PRIMARY KEY,
    content_item_id BIGINT NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    instrument_id BIGINT NOT NULL REFERENCES instruments(id) ON DELETE CASCADE,
    mention_candidate_id BIGINT REFERENCES mention_candidates(id), -- Link back to original AI candidate
    
    mention_text VARCHAR(200), -- Final approved mention text
    mention_type VARCHAR(20) NOT NULL, -- 'explicit', 'hashtag', 'ticker', 'name'
    sentiment VARCHAR(10), -- 'positive', 'negative', 'neutral'
    confidence DECIMAL(3,2) DEFAULT 1.00, -- Final confidence (usually 1.00 after human review)
    
    context_snippet TEXT, -- Surrounding text for context
    position_in_content INTEGER, -- Character position or timestamp
    mention_strength VARCHAR(20) DEFAULT 'moderate', -- weak, moderate, strong, very_strong
    exact_quote TEXT, -- The exact quote from the influencer
    
    is_recommendation BOOLEAN DEFAULT FALSE, -- Final determination of recommendation
    recommendation_type VARCHAR(10), -- 'buy', 'sell', 'hold', 'avoid'
    target_price DECIMAL(20,8), -- If price target mentioned
    recommendation_strength VARCHAR(20), -- 'weak', 'moderate', 'strong', 'very_strong'
    
    approved_by BIGINT REFERENCES users(id), -- Who approved this mention
    approved_at TIMESTAMP NOT NULL,
    review_notes TEXT, -- Human reviewer notes
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(content_item_id, instrument_id, mention_text)
);

CREATE INDEX idx_mentions_content ON content_mentions (content_item_id);
CREATE INDEX idx_mentions_instrument ON content_mentions (instrument_id);
CREATE INDEX idx_mentions_sentiment ON content_mentions (sentiment);
CREATE INDEX idx_mentions_recommendation ON content_mentions (is_recommendation);
CREATE INDEX idx_mentions_strength ON content_mentions (mention_strength);
CREATE INDEX idx_mentions_approved_by ON content_mentions (approved_by);
CREATE INDEX idx_mentions_candidate ON content_mentions (mention_candidate_id);


CREATE TABLE content_engagement_history (
    id BIGSERIAL PRIMARY KEY,
    content_item_id BIGINT NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    dislike_count INTEGER DEFAULT 0, -- For platforms that support it
    
    retweet_count INTEGER DEFAULT 0, -- Twitter
    quote_tweet_count INTEGER DEFAULT 0, -- Twitter
    bookmark_count INTEGER DEFAULT 0, -- Twitter
    subscriber_gain INTEGER DEFAULT 0, -- YouTube (gained from this video)
    
    engagement_rate DECIMAL(5,4), -- (likes + comments + shares) / views
    like_to_view_ratio DECIMAL(5,4), -- likes / views
    comment_to_view_ratio DECIMAL(5,4), -- comments / views
    
    snapshot_type VARCHAR(20) DEFAULT 'scheduled', -- 'initial', 'scheduled', 'manual', 'final'
    data_source VARCHAR(20) DEFAULT 'api', -- 'api', 'manual', 'estimated'
    
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_engagement_content_time ON content_engagement_history (content_item_id, recorded_at DESC);
CREATE INDEX idx_engagement_recorded_at ON content_engagement_history (recorded_at DESC);
CREATE INDEX idx_engagement_view_count ON content_engagement_history (view_count DESC);
CREATE INDEX idx_engagement_type ON content_engagement_history (snapshot_type);

CREATE TABLE influencer_engagement_history (
    id BIGSERIAL PRIMARY KEY,
    influencer_id BIGINT NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
    
    youtube_subscribers INTEGER,
    twitter_followers INTEGER,
    tiktok_followers INTEGER,
    telegram_members INTEGER,
    
    avg_views_per_video INTEGER,
    avg_likes_per_video INTEGER,
    avg_comments_per_video INTEGER,
    total_content_posted INTEGER, -- Content posted in measurement period
    
    youtube_subscriber_growth INTEGER, -- Change since last snapshot
    twitter_follower_growth INTEGER,
    engagement_growth_rate DECIMAL(5,4), -- % change in engagement
    
    measurement_period_days INTEGER DEFAULT 30,
    snapshot_type VARCHAR(20) DEFAULT 'monthly', -- 'weekly', 'monthly', 'quarterly'
    
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_influencer_engagement_time ON influencer_engagement_history (influencer_id, recorded_at DESC);
CREATE INDEX idx_influencer_engagement_recorded_at ON influencer_engagement_history (recorded_at DESC);
CREATE INDEX idx_influencer_engagement_growth ON influencer_engagement_history (youtube_subscriber_growth DESC);


CREATE TABLE price_history (
    id BIGSERIAL PRIMARY KEY,
    instrument_id BIGINT NOT NULL REFERENCES instruments(id) ON DELETE CASCADE,
    
    price DECIMAL(20,8) NOT NULL,
    volume DECIMAL(20,2),
    market_cap DECIMAL(20,2),
    
    open_price DECIMAL(20,8),
    high_price DECIMAL(20,8),
    low_price DECIMAL(20,8),
    close_price DECIMAL(20,8),
    
    recorded_at TIMESTAMP NOT NULL,
    data_source VARCHAR(50) DEFAULT 'api', -- api, manual, calculated
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(instrument_id, recorded_at)
);

CREATE INDEX idx_price_history_instrument_date ON price_history (instrument_id, recorded_at DESC);
CREATE INDEX idx_price_history_date ON price_history (recorded_at DESC);

CREATE TABLE mention_performance (
    id BIGSERIAL PRIMARY KEY,
    content_mention_id BIGINT NOT NULL REFERENCES content_mentions(id) ON DELETE CASCADE,
    
    investment_timeframe VARCHAR(20) NOT NULL, -- '1hour', '1day', '1week'
    holding_period VARCHAR(20) NOT NULL, -- '1week', '1month', '3months', '6months', '1year'
    
    price_at_mention DECIMAL(20,8) NOT NULL, -- Price when content was published
    price_at_investment DECIMAL(20,8), -- Price at investment time (after delay)
    price_at_evaluation DECIMAL(20,8), -- Price at end of holding period
    current_price DECIMAL(20,8), -- Most recent price (for ongoing positions)
    
    return_percentage DECIMAL(8,4), -- Percentage return for the holding period
    max_gain_percentage DECIMAL(8,4), -- Maximum gain during holding period
    max_loss_percentage DECIMAL(8,4), -- Maximum loss during holding period
    
    status VARCHAR(20) DEFAULT 'active', -- active, completed, failed
    evaluation_date TIMESTAMP, -- When holding period ends
    
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_performance_mention ON mention_performance (content_mention_id);
CREATE INDEX idx_performance_timeframe ON mention_performance (investment_timeframe);
CREATE INDEX idx_performance_return ON mention_performance (return_percentage DESC);
CREATE INDEX idx_performance_status ON mention_performance (status);
CREATE INDEX idx_performance_evaluation_date ON mention_performance (evaluation_date);

CREATE TABLE ai_processing_logs (
    id BIGSERIAL PRIMARY KEY,
    content_item_id BIGINT NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    
    processing_stage VARCHAR(30) NOT NULL, -- 'transcript', 'mention_extraction', 'sentiment_analysis'
    ai_model VARCHAR(50) NOT NULL,
    model_version VARCHAR(20),
    
    input_text TEXT, -- What was sent to AI
    output_data JSONB, -- Raw AI response
    processing_time_ms INTEGER,
    
    status VARCHAR(20) NOT NULL, -- 'success', 'partial_success', 'failed'
    error_message TEXT,
    tokens_used INTEGER, -- For cost tracking
    
    confidence_score DECIMAL(3,2),
    mentions_extracted INTEGER,
    
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_logs_content ON ai_processing_logs (content_item_id);
CREATE INDEX idx_ai_logs_stage ON ai_processing_logs (processing_stage);
CREATE INDEX idx_ai_logs_status ON ai_processing_logs (status);
CREATE INDEX idx_ai_logs_processed_at ON ai_processing_logs (processed_at DESC);

CREATE TABLE review_feedback (
    id BIGSERIAL PRIMARY KEY,
    mention_candidate_id BIGINT NOT NULL REFERENCES mention_candidates(id) ON DELETE CASCADE,
    reviewer_id BIGINT NOT NULL REFERENCES users(id),
    
    feedback_type VARCHAR(30) NOT NULL, -- 'false_positive', 'false_negative', 'wrong_symbol', 'wrong_sentiment', 'missing_context'
    feedback_severity VARCHAR(10) DEFAULT 'minor', -- 'minor', 'major', 'critical'
    
    issue_description TEXT NOT NULL,
    suggested_improvement TEXT,
    correct_symbol VARCHAR(20), -- What the symbol should have been
    correct_sentiment VARCHAR(10), -- What the sentiment should have been
    
    ai_model_target VARCHAR(50), -- Which AI model this feedback is for
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feedback_candidate ON review_feedback (mention_candidate_id);
CREATE INDEX idx_feedback_reviewer ON review_feedback (reviewer_id);
CREATE INDEX idx_feedback_type ON review_feedback (feedback_type);
CREATE INDEX idx_feedback_severity ON review_feedback (feedback_severity);


CREATE TABLE portfolio_simulations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    
    name VARCHAR(200),
    description TEXT,
    influencer_id BIGINT REFERENCES influencers(id) ON DELETE CASCADE,
    content_item_id BIGINT REFERENCES content_items(id) ON DELETE CASCADE,
    
    total_investment DECIMAL(12,2) NOT NULL,
    investment_mode VARCHAR(20) DEFAULT 'equal', -- equal, weighted, custom
    investment_delay VARCHAR(20) DEFAULT '1hour',
    
    current_value DECIMAL(12,2),
    total_return DECIMAL(12,2),
    return_percentage DECIMAL(8,4),
    
    status VARCHAR(20) DEFAULT 'active', -- active, archived, deleted
    is_public BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_simulations_user ON portfolio_simulations (user_id);
CREATE INDEX idx_simulations_influencer ON portfolio_simulations (influencer_id);
CREATE INDEX idx_simulations_content ON portfolio_simulations (content_item_id);
CREATE INDEX idx_simulations_public ON portfolio_simulations (is_public);
CREATE INDEX idx_simulations_return ON portfolio_simulations (return_percentage DESC);

CREATE TABLE simulation_allocations (
    id BIGSERIAL PRIMARY KEY,
    portfolio_simulation_id BIGINT NOT NULL REFERENCES portfolio_simulations(id) ON DELETE CASCADE,
    instrument_id BIGINT NOT NULL REFERENCES instruments(id) ON DELETE CASCADE,
    
    allocation_amount DECIMAL(12,2) NOT NULL,
    allocation_percentage DECIMAL(5,2),
    shares_purchased DECIMAL(20,8), -- Number of tokens/shares
    
    current_value DECIMAL(12,2),
    return_amount DECIMAL(12,2),
    return_percentage DECIMAL(8,4),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(portfolio_simulation_id, instrument_id)
);

CREATE INDEX idx_allocations_portfolio ON simulation_allocations (portfolio_simulation_id);
CREATE INDEX idx_allocations_instrument ON simulation_allocations (instrument_id);


CREATE TABLE influencer_performance_summary (
    id BIGSERIAL PRIMARY KEY,
    influencer_id BIGINT NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
    
    period_type VARCHAR(20) NOT NULL, -- 'weekly', 'monthly', 'quarterly', 'yearly', 'all_time'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    total_content_items INTEGER DEFAULT 0,
    total_mentions INTEGER DEFAULT 0,
    total_recommendations INTEGER DEFAULT 0,
    
    avg_return_1h DECIMAL(8,4), -- Average return at 1 hour
    avg_return_1d DECIMAL(8,4), -- Average return at 1 day
    avg_return_1w DECIMAL(8,4), -- Average return at 1 week
    avg_return_1m DECIMAL(8,4), -- Average return at 1 month
    
    hit_rate_1h DECIMAL(5,2), -- Percentage of profitable picks at 1 hour
    hit_rate_1d DECIMAL(5,2), -- Percentage of profitable picks at 1 day
    hit_rate_1w DECIMAL(5,2), -- Percentage of profitable picks at 1 week
    hit_rate_1m DECIMAL(5,2), -- Percentage of profitable picks at 1 month
    
    best_pick_return DECIMAL(8,4),
    worst_pick_return DECIMAL(8,4),
    
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(influencer_id, period_type, period_start)
);

CREATE INDEX idx_performance_summary_influencer ON influencer_performance_summary (influencer_id);
CREATE INDEX idx_performance_summary_period ON influencer_performance_summary (period_type, period_start);
CREATE INDEX idx_performance_summary_avg_return ON influencer_performance_summary (avg_return_1w DESC);


CREATE TABLE api_configurations (
    id BIGSERIAL PRIMARY KEY,
    service_name VARCHAR(50) NOT NULL, -- 'coingecko', 'coinmarketcap', 'twitter', 'youtube'
    api_key_encrypted TEXT,
    rate_limit_per_minute INTEGER,
    rate_limit_per_day INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    last_used TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(service_name)
);

CREATE TABLE system_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description TEXT,
    setting_type VARCHAR(20) DEFAULT 'string', -- string, integer, boolean, json
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO system_settings (setting_key, setting_value, description, setting_type) VALUES
('default_investment_amount', '100', 'Default investment amount in USD', 'integer'),
('supported_investment_delays', '["1hour", "3hours", "12hours", "1day", "1week"]', 'Available investment delay options', 'json'),
('supported_holding_periods', '["1week", "1month", "3months", "6months", "1year"]', 'Available holding period options', 'json'),
('price_update_frequency_minutes', '60', 'How often to update price data (in minutes)', 'integer'),
('content_scraping_enabled', 'true', 'Enable automatic content scraping', 'boolean'),
('max_mentions_per_content', '50', 'Maximum mentions to extract per content item', 'integer'),
('engagement_snapshot_frequency_hours', '6', 'How often to snapshot engagement metrics (in hours)', 'integer'),
('engagement_retention_days', '365', 'How long to keep engagement history (in days)', 'integer');

INSERT INTO instruments (symbol, name, instrument_type, category, description, is_active) VALUES
('BTC', 'Bitcoin', 'crypto', 'L1', 'The first and largest cryptocurrency', true),
('ETH', 'Ethereum', 'crypto', 'L1', 'Smart contract platform and cryptocurrency', true),
('USDC', 'USD Coin', 'crypto', 'Stablecoin', 'Fully-backed US dollar stablecoin', true),
('USDT', 'Tether', 'crypto', 'Stablecoin', 'The largest stablecoin by market cap', true);


CREATE VIEW influencer_leaderboard AS
SELECT 
    i.id,
    i.username,
    i.display_name,
    i.follower_count,
    i.performance_score,
    i.hit_rate,
    i.avg_return,
    i.total_mentions,
    COUNT(ci.id) as total_content_items,
    MAX(ci.published_at) as last_content_date
FROM influencers i
LEFT JOIN content_items ci ON i.id = ci.influencer_id
WHERE i.status = 'active'
GROUP BY i.id, i.username, i.display_name, i.follower_count, i.performance_score, i.hit_rate, i.avg_return, i.total_mentions
ORDER BY i.performance_score DESC NULLS LAST;


CREATE VIEW content_pending_review AS
SELECT 
    ci.id,
    ci.title,
    ci.platform,
    ci.published_at,
    i.username as influencer_username,
    i.display_name as influencer_name,
    ci.workflow_status,
    COUNT(mc.id) as candidate_mentions,
    COUNT(CASE WHEN mc.review_status = 'pending' THEN 1 END) as pending_mentions,
    ci.ai_processing_completed_at,
    EXTRACT(EPOCH FROM (NOW() - ci.ai_processing_completed_at))/3600 as hours_since_ai_processing
FROM content_items ci
JOIN influencers i ON ci.influencer_id = i.id
LEFT JOIN mention_candidates mc ON ci.id = mc.content_item_id
WHERE ci.workflow_status IN ('mention_review', 'mention_extraction')
  AND ci.human_review_required = true
  AND ci.human_reviewed_at IS NULL
GROUP BY ci.id, ci.title, ci.platform, ci.published_at, i.username, i.display_name, ci.workflow_status, ci.ai_processing_completed_at
ORDER BY ci.published_at DESC;

CREATE VIEW mention_candidates_pending AS
SELECT 
    mc.id,
    mc.extracted_text,
    mc.suggested_symbol,
    mc.ai_confidence,
    mc.sentiment_label,
    mc.exact_quote,
    mc.context_snippet,
    ci.title as content_title,
    i.username as influencer_username,
    ci.published_at as content_published_at,
    CASE 
        WHEN inst.symbol IS NOT NULL THEN inst.symbol 
        ELSE mc.suggested_symbol 
    END as display_symbol,
    CASE 
        WHEN inst.name IS NOT NULL THEN inst.name 
        ELSE 'Unknown Asset' 
    END as display_name
FROM mention_candidates mc
JOIN content_items ci ON mc.content_item_id = ci.id
JOIN influencers i ON ci.influencer_id = i.id
LEFT JOIN instruments inst ON mc.suggested_instrument_id = inst.id
WHERE mc.review_status = 'pending'
ORDER BY mc.ai_confidence DESC, ci.published_at DESC;

CREATE VIEW reviewer_performance AS
SELECT 
    u.id,
    u.username,
    u.first_name,
    u.last_name,
    u.total_reviews_completed,
    u.avg_review_time_minutes,
    u.review_accuracy_score,
    COUNT(mc.id) as reviews_last_30_days,
    AVG(CASE WHEN mc.review_status IN ('approved', 'modified') THEN 1.0 ELSE 0.0 END) as approval_rate_30_days,
    MIN(mc.reviewed_at) as first_review_date,
    MAX(mc.reviewed_at) as last_review_date
FROM users u
LEFT JOIN mention_candidates mc ON u.id = mc.reviewed_by 
    AND mc.reviewed_at >= NOW() - INTERVAL '30 days'
WHERE u.can_review_mentions = true
GROUP BY u.id, u.username, u.first_name, u.last_name, u.total_reviews_completed, u.avg_review_time_minutes, u.review_accuracy_score
ORDER BY u.total_reviews_completed DESC;

CREATE VIEW content_engagement_trends AS
SELECT 
    ci.id,
    ci.title,
    ci.published_at,
    i.username as influencer_username,
    
    ci.view_count as current_views,
    ci.like_count as current_likes,
    ci.comment_count as current_comments,
    
    first_snapshot.view_count as initial_views,
    first_snapshot.like_count as initial_likes,
    first_snapshot.comment_count as initial_comments,
    
    (ci.view_count - COALESCE(first_snapshot.view_count, 0)) as view_growth,
    (ci.like_count - COALESCE(first_snapshot.like_count, 0)) as like_growth,
    (ci.comment_count - COALESCE(first_snapshot.comment_count, 0)) as comment_growth,
    
    CASE 
        WHEN first_snapshot.view_count > 0 THEN 
            ((ci.view_count - first_snapshot.view_count)::DECIMAL / first_snapshot.view_count) * 100 
        ELSE NULL 
    END as view_growth_percentage,
    
    CASE 
        WHEN ci.published_at < NOW() - INTERVAL '1 day' THEN
            (ci.view_count::DECIMAL / EXTRACT(EPOCH FROM (NOW() - ci.published_at)) * 86400)
        ELSE NULL
    END as views_per_day,
    
    latest_snapshot.recorded_at as last_updated
    
FROM content_items ci
JOIN influencers i ON ci.influencer_id = i.id
LEFT JOIN content_engagement_history first_snapshot ON ci.id = first_snapshot.content_item_id 
    AND first_snapshot.snapshot_type = 'initial'
LEFT JOIN content_engagement_history latest_snapshot ON ci.id = latest_snapshot.content_item_id 
    AND latest_snapshot.recorded_at = (
        SELECT MAX(recorded_at) 
        FROM content_engagement_history 
        WHERE content_item_id = ci.id
    )
WHERE ci.published_at >= NOW() - INTERVAL '30 days'
  AND ci.is_published = true
ORDER BY view_growth_percentage DESC NULLS LAST;

CREATE VIEW top_performing_mentions AS
SELECT 
    cm.id,
    inst.symbol,
    inst.name,
    i.username as influencer_username,
    ci.title as content_title,
    ci.published_at,
    mp.return_percentage,
    mp.investment_timeframe,
    mp.holding_period
FROM content_mentions cm
JOIN instruments inst ON cm.instrument_id = inst.id
JOIN content_items ci ON cm.content_item_id = ci.id
JOIN influencers i ON ci.influencer_id = i.id
JOIN mention_performance mp ON cm.id = mp.content_mention_id
WHERE ci.published_at >= NOW() - INTERVAL '30 days'
  AND mp.status = 'completed'
  AND mp.return_percentage IS NOT NULL
ORDER BY mp.return_percentage DESC
LIMIT 50;
