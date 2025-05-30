import { VideoItem, CardSize } from '../types';
import { formatViewCount, formatDuration } from '../utils/bubbleUtils';

/**
 * Class to handle rendering of video cards on canvas
 */
export class BubbleCard {
  private ctx: CanvasRenderingContext2D;
  private video: VideoItem;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private selected: boolean;
  private thumbnailImage: HTMLImageElement | null = null;
  private profileImage: HTMLImageElement | null = null;
  private thumbnailLoaded: boolean = false;
  private profileLoaded: boolean = false;
  private thumbnailError: boolean = false;
  private profileError: boolean = false;

  /**
   * Create a new BubbleCard
   * @param ctx Canvas rendering context
   * @param video Video item data
   * @param x X position of card center
   * @param y Y position of card center
   * @param size Card size (width and height)
   * @param selected Whether the card is selected
   */
  constructor(
    ctx: CanvasRenderingContext2D,
    video: VideoItem,
    x: number,
    y: number,
    size: CardSize,
    selected: boolean = false
  ) {
    this.ctx = ctx;
    this.video = video;
    this.x = x;
    this.y = y;
    this.width = size.cardWidth;
    this.height = size.cardHeight;
    this.selected = selected;

    if (video.thumbnail_url) {
      this.thumbnailImage = new Image();
      this.thumbnailImage.onload = () => {
        this.thumbnailLoaded = true;
      };
      this.thumbnailImage.onerror = () => {
        this.thumbnailError = true;
      };
      this.thumbnailImage.src = video.thumbnail_url;
    }

    if (video.influencer?.profile_image_url) {
      this.profileImage = new Image();
      this.profileImage.onload = () => {
        this.profileLoaded = true;
      };
      this.profileImage.onerror = () => {
        this.profileError = true;
      };
      this.profileImage.src = video.influencer.profile_image_url;
    }
  }

  /**
   * Draw the card on the canvas
   */
  draw(): void {
    const { ctx, x, y, width, height, selected } = this;
    const thumbnailHeight = height * 0.6;
    const infoHeight = height * 0.4;
    
    ctx.save();
    
    const left = x - width / 2;
    const top = y - height / 2;
    
    if (selected) {
      ctx.shadowColor = 'rgba(168, 85, 247, 0.6)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    } else {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
    }
    
    ctx.fillStyle = '#1f2937'; // Gray-800
    ctx.beginPath();
    ctx.roundRect(left, top, width, height, 8);
    ctx.fill();
    
    if (selected) {
      ctx.strokeStyle = '#a855f7'; // Primary-500
      ctx.lineWidth = 3;
    } else {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
    }
    ctx.stroke();
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    this.drawThumbnail(left, top, width, thumbnailHeight);
    
    this.drawInfoArea(left, top + thumbnailHeight, width, infoHeight);
    
    ctx.restore();
  }

  /**
   * Draw the thumbnail area of the card
   */
  private drawThumbnail(left: number, top: number, width: number, height: number): void {
    const { ctx, video, thumbnailImage, thumbnailLoaded, thumbnailError } = this;
    
    ctx.fillStyle = '#111827'; // Gray-900
    ctx.fillRect(left, top, width, height);
    
    if (thumbnailImage && thumbnailLoaded) {
      const imgRatio = thumbnailImage.width / thumbnailImage.height;
      const cardRatio = width / height;
      
      let drawWidth, drawHeight, offsetX, offsetY;
      
      if (imgRatio > cardRatio) {
        drawHeight = height;
        drawWidth = height * imgRatio;
        offsetX = (width - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = width;
        drawHeight = width / imgRatio;
        offsetX = 0;
        offsetY = (height - drawHeight) / 2;
      }
      
      ctx.drawImage(thumbnailImage, left + offsetX, top + offsetY, drawWidth, drawHeight);
    } else if (thumbnailError || !video.thumbnail_url) {
      ctx.fillStyle = '#374151'; // Gray-700
      ctx.fillRect(left, top, width, height);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('▶', left + width / 2, top + height / 2);
    }
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(left + 5, top + 5, 24, 24, 4);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('▶', left + 17, top + 17); // YouTube icon
    
    const durationText = formatDuration(video.duration_seconds);
    const textWidth = ctx.measureText(durationText).width;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(left + width - textWidth - 14, top + height - 24, textWidth + 10, 20, 4);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      durationText,
      left + width - textWidth / 2 - 9,
      top + height - 14
    );
  }

  /**
   * Draw the info area of the card
   */
  private drawInfoArea(left: number, top: number, width: number, height: number): void {
    const { ctx, video, profileImage, profileLoaded } = this;
    const padding = 8;
    
    ctx.fillStyle = '#111827'; // Gray-900
    ctx.fillRect(left, top, width, height);
    
    const profileSize = 24;
    const profileLeft = left + padding;
    const profileTop = top + padding;
    
    if (profileImage && profileLoaded) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(profileLeft + profileSize / 2, profileTop + profileSize / 2, profileSize / 2, 0, Math.PI * 2);
      ctx.clip();
      
      ctx.drawImage(profileImage, profileLeft, profileTop, profileSize, profileSize);
      ctx.restore();
    } else {
      ctx.fillStyle = '#6b21a8'; // Primary-800
      ctx.beginPath();
      ctx.arc(profileLeft + profileSize / 2, profileTop + profileSize / 2, profileSize / 2, 0, Math.PI * 2);
      ctx.fill();
      
      const initial = video.influencer?.display_name?.[0]?.toUpperCase() || '?';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initial, profileLeft + profileSize / 2, profileTop + profileSize / 2);
    }
    
    ctx.fillStyle = '#f9fafb'; // Gray-50
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const nameText = video.influencer?.display_name || 'Unknown';
    const nameLeft = profileLeft + profileSize + 8;
    const nameTop = profileTop;
    
    const maxNameWidth = width - nameLeft - padding;
    let displayName = nameText;
    let nameMetrics = ctx.measureText(displayName);
    
    if (nameMetrics.width > maxNameWidth) {
      for (let i = nameText.length - 1; i > 0; i--) {
        displayName = nameText.substring(0, i) + '...';
        nameMetrics = ctx.measureText(displayName);
        if (nameMetrics.width <= maxNameWidth) break;
      }
    }
    
    ctx.fillText(displayName, nameLeft, nameTop);
    
    ctx.fillStyle = '#9ca3af'; // Gray-400
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const viewText = `${formatViewCount(video.view_count)} views`;
    ctx.fillText(viewText, nameLeft, nameTop + 16);
  }
}
