# Crypto Bubble Interface

An interactive bubble visualization interface for cryptocurrency influencer content, built with React 18, TypeScript, and the CryptoVibes design system.

## Features

- **Interactive Bubble Layout**: Dynamic spiral positioning algorithm for video content
- **Real-time Canvas Rendering**: Smooth 60fps HTML5 canvas with custom card rendering
- **90s Computing Aesthetic**: Intense 3D depth effects with complex shadows and gradients
- **Responsive Design**: Adapts to different screen sizes and canvas dimensions
- **Live Data Simulation**: Mock data generation with realistic crypto influencer content
- **Advanced Interactions**: Click-to-select, hover effects, and detailed side panels

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone/Download the project files**
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser to http://localhost:3000**

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── CryptoBubbleInterface.tsx    # Main component
│   ├── BubbleHeader.tsx             # Header with navigation
│   ├── BubbleControls.tsx           # Date/view controls
│   └── BubbleCanvas.tsx             # Canvas rendering logic
├── data/
│   └── mockData.ts                  # Mock influencer/video data
├── hooks/
│   └── useBubbleData.ts            # Data fetching and state management
├── types/
│   └── index.ts                     # TypeScript interfaces
├── utils/
│   ├── spiralLayout.ts              # Bubble positioning algorithms
│   └── formatting.ts                # Number/time formatting utilities
└── index.css                       # Design system CSS variables
```

## Design System Integration

This project implements the CryptoVibes design system with:

- **Color Palette**: Purple primary colors, success/loss indicators, dark theme grays
- **Typography**: Inter, Space Grotesk, and Silkscreen fonts
- **3D Effects**: Multi-layer shadows with intense depth simulation
- **Interactive States**: Raised, floating, and pressed panel effects
- **Gradients**: Turquoise, crypto, and brand color combinations

## Canvas Features

### Bubble Rendering
- **Dynamic Sizing**: Cards scale based on view count metrics
- **Spiral Layout**: Golden ratio-based positioning for natural distribution
- **Platform Integration**: YouTube thumbnails, Twitter posts, duration badges
- **Collision Detection**: Prevents overlapping cards with smart repositioning

### Interaction System
- **Click Selection**: Cards highlight with purple glow and bring to front
- **Canvas Navigation**: Click empty space to deselect
- **Responsive Hit Detection**: Accurate click targeting across different card sizes
- **Smooth Animations**: 60fps rendering with requestAnimationFrame

## Data Integration

### Mock Data Structure
- **Influencers**: Coin Bureau, Benjamin Cowen, Raoul Pal, and others
- **Content Types**: YouTube videos, Twitter posts, with realistic metrics
- **Dynamic Generation**: Configurable content count based on view mode
- **Engagement Metrics**: View counts, like ratios, platform-specific data

### Future Integration Points
- **Airtable API**: Ready for real data source integration
- **Live Updates**: WebSocket support for real-time content
- **User Authentication**: Profile management and preferences
- **Content Filtering**: Search, categories, and recommendation systems

## Performance Optimizations

- **Canvas Efficiency**: Dirty region tracking and selective redraws
- **Memory Management**: Proper cleanup of animation frames and event listeners
- **Responsive Calculations**: Debounced resize handling
- **TypeScript**: Full type safety for development efficiency

## Customization

### Adding New Platforms
1. Update the `Influencer` interface in `src/types/index.ts`
2. Add platform-specific rendering in `BubbleCanvas.tsx`
3. Update mock data in `src/data/mockData.ts`

### Modifying Layout Algorithm
- Edit `calculateSpiralPositions` in `src/utils/spiralLayout.ts`
- Adjust spacing, radius increments, and angle calculations
- Test with different content volumes (5-50 items)

### Styling Updates
- Modify CSS variables in `src/index.css`
- Update Tailwind configuration in `tailwind.config.js`
- Customize shadow effects and color schemes

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires HTML5 Canvas and ES2020 support.

## Development Tips

### For Non-Technical Users
1. **Install Node.js** from https://nodejs.org (choose LTS version)
2. **Download project files** and extract to a folder
3. **Open terminal/command prompt** in the project folder
4. **Run the install command** exactly as shown above
5. **Start the dev server** and open the provided URL

### For Developers
- Hot reload enabled for instant development feedback
- TypeScript provides excellent IDE support and error catching
- Canvas rendering is optimized but can be further enhanced for mobile
- Mock data system makes it easy to test different scenarios
- Component architecture supports easy feature additions

## Next Steps

1. **Real Data Integration**: Connect to Airtable or other APIs
2. **Mobile Optimization**: Touch interactions and responsive canvas
3. **Advanced Filtering**: Search, categories, sentiment analysis
4. **User Preferences**: Save layout preferences, favorite influencers
5. **Performance Monitoring**: Add metrics for canvas rendering performance

## License

MIT License - feel free to use this for your projects!