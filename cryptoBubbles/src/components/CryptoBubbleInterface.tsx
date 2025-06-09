import React, { useState, useEffect, useRef } from 'react';
import { BubbleHeader } from './BubbleHeader';
import { BubbleControls } from './BubbleControls';
import { BubbleCanvas } from './BubbleCanvas';
import { useBubbleData } from '../hooks/useBubbleData';
import { formatViewCount } from '../utils/formatting';
import { ExternalLink, Heart, Eye, Clock, TrendingUp, X, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import CryptoVideoSimulator from './investment/CryptoVideoSimulator';
import { QueryDebugTool } from './QueryDebugTool';

// Coin name mapping for tooltips
const COIN_NAMES: Record<string, string> = {
  'BITCOIN': 'Bitcoin',
  'BTC': 'Bitcoin',
  'ETHEREUM': 'Ethereum', 
  'ETH': 'Ethereum',
  'CARDANO': 'Cardano',
  'ADA': 'Cardano',
  'SOLANA': 'Solana',
  'SOL': 'Solana',
  'POLKADOT': 'Polkadot',
  'DOT': 'Polkadot',
  'DOGECOIN': 'Dogecoin',
  'DOGE': 'Dogecoin',
  'AVALANCHE': 'Avalanche',
  'AVAX': 'Avalanche',
  'CHAINLINK': 'Chainlink',
  'LINK': 'Chainlink',
  'POLYGON': 'Polygon',
  'MATIC': 'Polygon',
  'XRP': 'Ripple',
  'RIPPLE': 'Ripple',
  'BNB': 'Binance Coin',
  'BINANCE COIN': 'Binance Coin',
  'SHIB': 'Shiba Inu',
  'SHIBA INU': 'Shiba Inu',
  'LITECOIN': 'Litecoin',
  'LTC': 'Litecoin',
  'UNISWAP': 'Uniswap',
  'UNI': 'Uniswap'
};

export const CryptoBubbleInterface: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 600 });
  const [expandedSummary, setExpandedSummary] = useState(false);
  const [showDebugTool, setShowDebugTool] = useState(false);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(true);
  const [showInvestmentSimulator, setShowInvestmentSimulator] = useState(false);
  
  const {
    bubbles,
    loading,
    error,
    selectedCard,
    selectedDate,
    viewMode,
    actions
  } = useBubbleData(canvasSize);

  // Reset expanded summary when card changes
  useEffect(() => {
    setExpandedSummary(false);
    // Automatically open the panel when a card is selected
    if (selectedCard && !isDetailsPanelOpen) {
      setIsDetailsPanelOpen(true);
    }
  }, [selectedCard?.id]);

  // Handle home navigation - reset to today's date and day view
  const handleHomeClick = () => {
    actions.changeDate(new Date());
    actions.changeViewMode('day');
  };

  // Handle window resize
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        // Account for the side panel only when it's open
        const panelWidth = isDetailsPanelOpen ? 320 : 0; // w-80 = 320px
        const availableWidth = window.innerWidth - panelWidth - 40; // panel + 40px total padding
        const newWidth = Math.max(600, availableWidth);
        const newHeight = Math.max(400, window.innerHeight - 200); // Account for header/controls
        setCanvasSize({ width: newWidth, height: newHeight });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [isDetailsPanelOpen]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">Error loading data</div>
          <button 
            onClick={actions.refreshData}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <BubbleHeader onHomeClick={handleHomeClick} />
      
      <BubbleControls
        selectedDate={selectedDate}
        viewMode={viewMode}
        loading={loading}
        onDateChange={actions.changeDate}
        onViewModeChange={actions.changeViewMode}
      />
      
      <div className="flex-1 flex relative">
        {/* Side Panel - Full Height Combined Video Details & Investment Simulator */}
        <div 
          className={`${isDetailsPanelOpen ? 'w-80' : 'w-0'} bg-gray-850 border-r-2 border-gray-700 shadow-panel-raised transition-all duration-300 relative overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-80 h-full flex flex-col">
          {selectedCard ? (
            <div className="bg-gray-900 border-2 border-primary-600 rounded-xl m-6 shadow-card-intense relative flex-1 flex flex-col overflow-hidden">
              <div className="p-3 flex-1 flex flex-col overflow-y-auto">
                {/* Thumbnail Preview */}
                {selectedCard.thumbnail_url && (
                  <div className="mb-6">
                  <div 
                    onClick={() => selectedCard?.watch_url && window.open(selectedCard.watch_url, '_blank', 'noopener,noreferrer')}
                    className="aspect-video bg-gray-800 rounded-lg border-2 border-gray-600 overflow-hidden shadow-panel-raised relative group cursor-pointer"
                  >
                    <img 
                      src={selectedCard.thumbnail_url} 
                      alt={selectedCard.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.className = 'w-full h-full bg-gray-700 flex items-center justify-center';
                        fallback.innerHTML = '<div class="text-gray-500 text-sm">Thumbnail Preview</div>';
                        target.parentElement?.appendChild(fallback);
                      }}
                    />
                    {/* Play overlay on thumbnail */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <div className="w-16 h-16 bg-black bg-opacity-70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ExternalLink size={20} className="text-white ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Video Title */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-100 mb-2 leading-tight">
                  {selectedCard.title}
                </h3>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-primary-400 font-medium text-sm">
                    {selectedCard.influencer.display_name}
                  </span>
                  <span className="text-gray-500 text-xs">•</span>
                  <div className="flex items-center gap-1">
                    <Clock size={12} className="text-gray-500" />
                    <span className="text-gray-500 text-xs">
                      {new Date(selectedCard.published_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>

                {/* Short Summary with expand/collapse */}
                {selectedCard.short_summary && (
                  <div className="mb-4">
                    <p 
                      className={`text-gray-300 text-xs leading-relaxed transition-all duration-300 ${
                        expandedSummary ? '' : 'line-clamp-3'
                      }`}
                    >
                      {selectedCard.short_summary}
                    </p>
                    {selectedCard.short_summary.length > 100 && (
                      <button
                        onClick={() => setExpandedSummary(!expandedSummary)}
                        className="text-gray-400 hover:text-gray-300 text-xs mt-1 transition-colors"
                        title={expandedSummary ? "Show less" : "Read more"}
                      >
                        {expandedSummary ? '...show less' : '...'}
                      </button>
                    )}
                  </div>
                )}

                {/* Coins Mentioned */}
                {selectedCard.coins_mentioned && selectedCard.coins_mentioned.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-gray-400 text-xs uppercase tracking-wide">Coins Mentioned</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedCard.coins_mentioned.map((coin, index) => {
                        const coinUpper = coin.toUpperCase();
                        const coinName = COIN_NAMES[coinUpper] || coin;
                        
                        return (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs font-medium text-gray-200 hover:bg-gray-700 transition-colors cursor-help"
                            title={coinName}
                          >
                            {coin}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mt-4"></div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-4 shadow-panel-raised">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye size={16} className="text-accent-turquoise" />
                    <span className="text-gray-400 text-xs uppercase tracking-wide">Views</span>
                  </div>
                  <div className="text-gray-100 font-bold text-lg">
                    {formatViewCount(selectedCard.view_count)}
                  </div>
                </div>
                
                <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-4 shadow-panel-raised">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart size={16} className="text-success-400" />
                    <span className="text-gray-400 text-xs uppercase tracking-wide">Likes</span>
                  </div>
                  <div className="text-gray-100 font-bold text-lg">
                    {formatViewCount(selectedCard.like_count)}
                  </div>
                </div>
              </div>


              {/* Duration (YouTube only) */}
              {selectedCard.influencer.platform === 'youtube' && selectedCard.duration_seconds > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-gray-400 text-sm">Duration</span>
                  </div>
                  <div className="text-gray-200 font-medium">
                    {Math.floor(selectedCard.duration_seconds / 60)}:{(selectedCard.duration_seconds % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="mt-6">
                <button 
                  onClick={() => setShowInvestmentSimulator(true)}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-panel-raised hover:shadow-panel-floating transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  <TrendingUp size={16} />
                  Investment Simulator
                </button>
              </div>
              </div>

              {/* Close Button */}
              <button 
                onClick={() => {
                  setShowInvestmentSimulator(false);
                  actions.selectCard(null);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors duration-200 z-10"
                title="Close details"
              >
                ✕
              </button>
              
              {/* Selection hint */}
              <div className="absolute top-4 left-4 text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                Video Details
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 border-2 border-gray-600 rounded-xl m-6 p-6 shadow-panel-raised flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 border-2 border-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-panel-raised">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-gray-300 text-lg font-medium mb-2">Select a Video</div>
                <div className="text-gray-500 text-sm max-w-xs mx-auto">
                  Click on any video bubble to view detailed information and metrics
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={() => setIsDetailsPanelOpen(!isDetailsPanelOpen)}
          className={`absolute top-1/2 -translate-y-1/2 z-10 bg-gray-800 border-2 border-gray-600 hover:bg-gray-700 text-gray-300 p-2 rounded-r-lg transition-all duration-300 shadow-panel-raised hover:shadow-panel-floating ${
            isDetailsPanelOpen ? 'left-80' : 'left-0'
          }`}
          title={isDetailsPanelOpen ? 'Hide panel' : 'Show panel'}
        >
          {isDetailsPanelOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        
        {/* Main Canvas Area */}
        <div 
          ref={containerRef} 
          className={`transition-all duration-300 p-5 ${selectedCard ? 'flex-1' : 'flex-1'} ${showInvestmentSimulator ? 'hidden' : ''}`}
          onClick={() => selectedCard && actions.selectCard(null)}
        >
          {loading ? (
            <div className="w-full h-full min-h-[400px] bg-gray-900 border-2 border-gray-700 rounded-xl flex items-center justify-center shadow-panel-raised">
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <div className="text-gray-400">Loading crypto influencers...</div>
              </div>
            </div>
          ) : bubbles.length === 0 ? (
            <div className="w-full h-full min-h-[400px] bg-gray-900 border-2 border-gray-700 rounded-xl flex items-center justify-center shadow-panel-raised">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 border-2 border-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-panel-raised">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-gray-300 text-lg font-medium mb-2">No videos posted</div>
                <div className="text-gray-500 text-sm max-w-xs mx-auto">
                  {viewMode === 'day' && (
                    <>No crypto influencer content found for {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</>
                  )}
                  {viewMode === 'week' && (
                    <>No crypto influencer content found for the week of {(() => {
                      const weekStart = new Date(selectedDate);
                      weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
                      return weekStart.toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      });
                    })()}</>
                  )}
                  {viewMode === 'month' && (
                    <>No crypto influencer content found for {selectedDate.toLocaleDateString('en-US', { 
                      month: 'long',
                      year: 'numeric'
                    })}</>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-xl overflow-hidden shadow-panel-floating">
              <BubbleCanvas
                bubbles={bubbles}
                onCardClick={actions.selectCard}
                canvasSize={canvasSize}
              />
            </div>
          )}
        </div>

        {/* Investment Simulator Extension - Takes over canvas area */}
        {showInvestmentSimulator && selectedCard && (
          <div className="flex-1 p-5">
            <div className="bg-gray-900 border-2 border-gray-700 rounded-xl h-full flex flex-col overflow-hidden shadow-panel-floating">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b-2 border-gray-700 bg-gray-900/95 backdrop-blur-sm">
                <div>
                  <h2 className="text-xl font-semibold text-gray-100">Investment Simulator</h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    How would a $1,000 investment made at the time of this video have played out?
                  </p>
                </div>
                <button
                  onClick={() => setShowInvestmentSimulator(false)}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                  title="Close Investment Simulator"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-hidden">
                <CryptoVideoSimulator
                  videoId={selectedCard.id}
                  videoTitle={selectedCard.title}
                  publishDate={selectedCard.published_at}
                  coinsMentioned={selectedCard.coins_mentioned || ['Bitcoin', 'Ethereum', 'Solana']}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="bg-gray-900 border-t-2 border-gray-700 px-6 py-4 shadow-panel-raised">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div className="text-gray-400">
              Displaying <span className="text-accent-turquoise font-medium">{bubbles.length}</span> influencers
            </div>
            <div className="text-gray-400">
              Total Views: <span className="text-success-400 font-medium">
                {formatViewCount(bubbles.reduce((sum, card) => sum + card.view_count, 0))}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Debug Tool Button (DEV only) */}
            {import.meta.env.DEV && (
              <button
                onClick={() => setShowDebugTool(!showDebugTool)}
                className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
                title="Open Query Debug Tool"
              >
                <Settings className="w-3 h-3" />
                Debug
              </button>
            )}
            
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></div>
              <span className="text-gray-400">Live Data</span>
            </div>
            <div className="text-gray-500 text-xs">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Debug Tool Modal */}
      {showDebugTool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">🔍 Query Debug Tool</h2>
              <button
                onClick={() => setShowDebugTool(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="p-0">
              <QueryDebugTool />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};