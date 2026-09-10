import {
  DownloadOutlined,
  ExpandOutlined,
  FileImageOutlined,
  PlaySquareOutlined,
} from '@ant-design/icons';
import { Image, Typography } from 'antd';
import type { MediaAsset } from '../types';

interface MediaThumbProps {
  asset: MediaAsset;
  size?: 'sm' | 'md';
  showActions?: boolean;
}

export function MediaThumb({
  asset,
  size = 'md',
  showActions = true,
}: MediaThumbProps) {
  const height = size === 'sm' ? 72 : 88;

  return (
    <div className={`media-thumb media-thumb-${size}`}>
      <div className="media-thumb-preview" style={{ height }}>
        {asset.url ? (
          asset.type === 'video' ? (
            <div className="media-video-wrap">
              <video
                src={asset.url}
                poster={asset.poster}
                muted
                playsInline
                preload="metadata"
              />
              <span className="media-video-badge">
                <PlaySquareOutlined /> 视频
              </span>
            </div>
          ) : (
            <Image
              src={asset.url}
              alt={asset.name}
              width="100%"
              height={height}
              style={{ objectFit: 'cover' }}
              preview={{ mask: '预览' }}
            />
          )
        ) : (
          <div
            className="media-thumb-fallback"
            style={{ background: asset.thumbColor }}
          >
            {asset.type === 'video' ? (
              <PlaySquareOutlined />
            ) : (
              <FileImageOutlined />
            )}
            <span>{asset.label ?? asset.type}</span>
          </div>
        )}
      </div>
      <div className="media-thumb-name" title={asset.name}>
        {asset.label ?? asset.name}
      </div>
      {showActions && (
        <div className="media-thumb-actions">
          <Typography.Link>
            <ExpandOutlined /> 全屏
          </Typography.Link>
          <Typography.Link>
            <DownloadOutlined /> 下载
          </Typography.Link>
        </div>
      )}
    </div>
  );
}

export function MediaGrid({
  assets,
  title,
  size = 'sm',
}: {
  assets: MediaAsset[];
  title?: string;
  size?: 'sm' | 'md';
}) {
  if (!assets.length) return null;
  return (
    <div className="media-section">
      {title && (
        <div className="media-section-title">
          <Typography.Text type="secondary">{title}</Typography.Text>
        </div>
      )}
      <div className="media-grid">
        {assets.map((asset) => (
          <MediaThumb
            key={asset.id}
            asset={asset}
            size={size}
            showActions={size === 'md'}
          />
        ))}
      </div>
    </div>
  );
}
