# Investment Simulation Data Flow Documentation

## Overview
This document explains how data flows through the investment simulation feature, including the graph and portfolio performance calculations.

## Data Sources

### 1. Content Items (Airtable)
- **Source**: `VITE_CONTENT_ITEMS_AIRTABLE_BASE_ID` table
- **Key Fields**:
  - `Coins Mentioned`: Array or comma-separated string of cryptocurrency names/symbols
  - `Publish Date`: When the video was published
  - `Publish Status`: Must be "Active" to be displayed

### 2. Instruments Metadata (Airtable)
- **Source**: `VITE_INSTRUMENTS_ITEMS_AIRTABLE_BASE_ID` table
- **Purpose**: Maps coin names to symbols and provides metadata
- **Key Fields**:
  - `Name`: Full cryptocurrency name (e.g., "Bitcoin")
  - `Symbol`: Trading symbol (e.g., "BTC")
  - `Category`: Coin category
  - `Logo`: URL to coin logo

### 3. Price History (Airtable)
- **Source**: `VITE_PRICE_HISTORY_AIRTABLE_BASE_ID` table
- **Purpose**: Historical price data for calculations
- **Key Fields**:
  - `Recorded At`: Date of price recording
  - `Price`: USD price at that date
  - `Instrument Relation`: Links to the coin in instruments table

### 4. Current Prices (CoinMarketCap API)
- **Source**: CoinMarketCap API via `coinMarketCapClient.ts`
- **Purpose**: Real-time current prices for comparison

## Data Flow Process

### Step 1: Content Selection
1. User selects a video card from the bubble interface
2. `CryptoBubbleInterface` passes `selectedCard.coins_mentioned` to `CryptoVideoSimulator`
3. Fallback to `['Bitcoin', 'Ethereum', 'Solana']` if no coins mentioned

### Step 2: Coin Data Loading (`useCoinData` hook)
```typescript
// Located: /src/hooks/useCoinData.ts
```

1. **Input**: Array of coin names/symbols from video
2. **Process**:
   - Fetch all available coin metadata from Airtable
   - Match input coins by name OR symbol (flexible matching)
   - Get current prices from CoinMarketCap API
   - Get initial prices from Airtable for video publication date
3. **Output**: `CoinData[]` array with:
   - `symbol`: Trading symbol (BTC, ETH, etc.)
   - `name`: Full name (Bitcoin, Ethereum, etc.)
   - `initialPrice`: Price at video publication
   - `currentPrice`: Latest price from CoinMarketCap
   - `allocation`: Percentage allocation (equal by default)
   - `isSelected`: Whether included in portfolio

### Step 3: Investment Data Calculation (`useInvestmentData` hook)
```typescript
// Located: /src/hooks/useInvestmentData.ts
```

1. **Input**: 
   - `coinsData`: Array from Step 2
   - `videoDate`: Publication date
   - `investmentDelay`: '1hour' | '1day' | '1week'

2. **Process**:
   - Calculate actual investment date (video date + delay)
   - Generate date range from investment date to today
   - Sample dates (every 7 days) to reduce API calls
   - For each sample date:
     - Get historical price for each selected coin
     - Calculate coin quantity: `(allocation * $1000) / initialPrice`
     - Calculate current value: `quantity * priceAtDate`
     - Sum all coin values for total portfolio value

3. **Output**: `InvestmentDataPoint[]` array with:
   - `date`: Display date (Start, Week 1, Current, etc.)
   - `value`: Total portfolio value in USD
   - `change`: Percentage change from initial $1000

### Step 4: Performance Chart (`CompactPerformanceChart`)
```typescript
// Located: /src/components/investment/CompactPerformanceChart.tsx
```

- **Input**: `InvestmentDataPoint[]` from Step 3
- **Renders**: Canvas-based line chart showing portfolio value over time
- **Features**: Hover tooltips, trend visualization

### Step 5: Strategy Comparison (`StrategyComparison`)
```typescript
// Located: /src/components/investment/StrategyComparison.tsx
```

- **Input**: Final portfolio value and returns from Step 3
- **Strategies Compared**:
  1. **Hold As Cash**: $1000 (no change)
  2. **Mentioned Coins Portfolio**: Real calculated data
  3. **Hold as Bitcoin**: **MOCK DATA** (currently hardcoded 15.56% return)

## Key Calculations

### Portfolio Value Calculation
```typescript
for each coin in selectedCoins {
  allocationAmount = $1000 * (coin.allocation / 100)
  coinQuantity = allocationAmount / coin.initialPrice
  coinCurrentValue = coinQuantity * coin.currentPrice
  totalPortfolioValue += coinCurrentValue
}
```

### Return Calculation
```typescript
portfolioReturn = totalPortfolioValue - $1000
portfolioReturnPercentage = (portfolioReturn / $1000) * 100
```

## Data Quality Issues

### Current Limitations
1. **Bitcoin Comparison**: Uses mock data instead of real calculation
2. **Historical Data Gaps**: Missing price data for some dates/coins
3. **API Rate Limits**: Sampling every 7 days to reduce calls
4. **Fallback Behavior**: Uses mock data if real calculation fails

### Error Handling
- Falls back to mock data if API calls fail
- Warns when price data is missing for specific dates
- Logs detailed calculation steps for debugging

## Debugging

### Console Logging
The system now includes comprehensive logging:

1. **Coin Data Flow**: `useCoinData` logs coin matching and price fetching
2. **Investment Calculations**: `useInvestmentData` logs each step of portfolio calculation
3. **Strategy Comparison**: `StrategyComparison` logs final performance data

### Key Log Markers
- `🚀 useCoinData: Starting to load coin data`
- `📊 === INVESTMENT DATA CALCULATION START ===`
- `🏆 === STRATEGY COMPARISON DATA ===`

## Critique Points

### Areas for Improvement
1. **Real Bitcoin Comparison**: Implement actual Bitcoin performance calculation
2. **More Strategies**: Add S&P 500, other crypto indices
3. **Better Date Sampling**: Smarter sampling based on volatility
4. **Data Validation**: Better handling of missing/invalid price data
5. **Performance**: Caching and optimization for repeated calculations

### Data Accuracy Concerns
1. **Price Data Source**: Relying on Airtable historical data vs real-time APIs
2. **Timing Assumptions**: Investment delay may not reflect real-world behavior
3. **Equal Allocation**: May not represent typical investment strategies
4. **Transaction Costs**: Not accounting for fees and slippage