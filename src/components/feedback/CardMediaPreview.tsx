import { FileImageOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import { useMemo, useState } from 'react';
import type { MediaAsset } from '../../types';

function MediaPreviewModal({
  asset,
  open,
  onClose,
}: {
  asset: MediaAsset | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!asset) return null;
  const isVideo = asset.type === 'video';
  const playable =
    Boolean(asset.url) &&
    /\.(mp4|webm|ogg)(\?|$)/i.test(asset.url ?? '');

  return (
    <Modal
      title={asset.name}
      open={open}
      onCancel={onClose}
      footer={null}
      width={isVideo ? 420 : 560}
      destroyOnHidden
      centered
    >
      <div className="card-media-modal-body">
        {isVideo ? (
          playable ? (
            <video
              className="card-media-modal-video"
              src={asset.url}
              poster={asset.poster}
              controls
              playsInline
              autoPlay
            />
          ) : (
            <div className="card-media-modal-fallback">
              {asset.poster || asset.url ? (
                <img src={asset.poster ?? asset.url} alt={asset.name} />
              ) : (
                <div className="card-media-modal-empty">暂无预览</div>
              )}
              <p className="card-media-modal-hint">演示环境展示封面；正式环境可播真实视频</p>
            </div>
          )
        ) : asset.url ? (
          <img className="card-media-modal-image" src={asset.url} alt={asset.name} />
        ) : (
          <div className="card-media-modal-empty">暂无预览</div>
        )}
      </div>
    </Modal>
  );
}

/** 群卡片媒体：按钮打开弹窗预览，不直接塞缩略图 */
export function CardMediaButtons({
  assets,
  title,
}: {
  assets: MediaAsset[];
  title?: string;
}) {
  const [current, setCurrent] = useState<MediaAsset | null>(null);
  const images = useMemo(() => assets.filter((a) => a.type === 'image'), [assets]);
  const videos = useMemo(() => assets.filter((a) => a.type === 'video'), [assets]);

  if (!assets.length) return null;

  return (
    <div className="card-media-block">
      {title && <div className="card-media-block-title">{title}</div>}
      {images.length > 0 && (
        <div className="card-media-group">
          <div className="card-media-group-label">图片 · {images.length}</div>
          <div className="card-media-actions">
            {images.map((asset, i) => (
              <button
                key={asset.id}
                type="button"
                className="card-media-btn"
                onClick={() => setCurrent(asset)}
              >
                <FileImageOutlined /> 查看图片 {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
      {videos.length > 0 && (
        <div className="card-media-group">
          <div className="card-media-group-label">视频 · {videos.length}</div>
          <div className="card-media-actions">
            {videos.map((asset, i) => (
              <button
                key={asset.id}
                type="button"
                className="card-media-btn"
                onClick={() => setCurrent(asset)}
              >
                <PlayCircleOutlined /> 查看视频 {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
      <MediaPreviewModal
        asset={current}
        open={Boolean(current)}
        onClose={() => setCurrent(null)}
      />
    </div>
  );
}
