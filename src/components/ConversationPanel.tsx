import { DownloadOutlined, UserOutlined } from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ConversationMessage } from '../types';
import { MediaThumb } from './MediaThumb';

interface ConversationPanelProps {
  messages: ConversationMessage[];
  selectable?: boolean;
  selectedTaskIds: string[];
  expandedIds: string[];
  headerMeta?: string;
  onToggleTask: (taskId: string, checked: boolean) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onToggleExpand: (id: string) => void;
}

export function ConversationPanel({
  messages,
  selectable = false,
  selectedTaskIds,
  expandedIds,
  headerMeta,
  onToggleTask,
  onExpandAll,
  onCollapseAll,
  onToggleExpand,
}: ConversationPanelProps) {
  const userInputCount = messages.filter((m) => m.role === 'user').length;

  return (
    <div className="split-panel conversation-panel">
      <div className="split-panel-header">
        <div className="split-panel-title">
          <Typography.Text strong>会话内容</Typography.Text>
          <Typography.Text type="secondary" className="split-panel-meta">
            {headerMeta ?? `${userInputCount} 条用户输入`}
          </Typography.Text>
        </div>
        <Space>
          <Select
            size="small"
            defaultValue="all"
            style={{ width: 120 }}
            options={[
              { value: 'all', label: '全部 Agent' },
              { value: 'virash', label: 'Virash' },
            ]}
          />
          <Typography.Link onClick={onExpandAll}>展开全部</Typography.Link>
          <Typography.Link onClick={onCollapseAll}>收起全部</Typography.Link>
        </Space>
      </div>

      <div className="split-panel-body">
        {messages.map((msg) => {
          const expanded = expandedIds.includes(msg.id);
          const checked = selectedTaskIds.includes(msg.taskId);

          return (
            <div
              key={msg.id}
              className={`message-card ${msg.role === 'user' ? 'is-user' : 'is-assistant'}`}
            >
              <div className="message-card-header">
                <Space wrap size={8}>
                  {selectable && (
                    <Checkbox
                      checked={checked}
                      onChange={(e) =>
                        onToggleTask(msg.taskId, e.target.checked)
                      }
                    />
                  )}
                  {msg.role === 'user' ? (
                    <>
                      <UserOutlined />
                      <Tag color="processing">用户输入</Tag>
                    </>
                  ) : (
                    <Tag color="success">Assistant</Tag>
                  )}
                  <Typography.Link
                    onClick={() => {
                      void navigator.clipboard.writeText(msg.taskId);
                      message.success('已复制 task_id');
                    }}
                  >
                    {msg.taskId.slice(0, 12)}...
                  </Typography.Link>
                  <Typography.Text type="secondary">{msg.time}</Typography.Text>
                  {msg.status && <Tag>{msg.status}</Tag>}
                  {msg.contentType && <Tag>{msg.contentType}</Tag>}
                  {msg.agent && <Tag color="blue">Agent: {msg.agent}</Tag>}
                </Space>
                <Typography.Link onClick={() => onToggleExpand(msg.id)}>
                  {expanded ? '收起' : '展开'}
                </Typography.Link>
              </div>

              {expanded && (
                <div className="message-card-body">
                  <pre className="message-content">{msg.content}</pre>

                  {msg.media && msg.media.length > 0 && (
                    <div className="media-section">
                      <div className="media-section-title">
                        <Typography.Text type="secondary">
                          {msg.mediaTitle ??
                            (msg.role === 'user'
                              ? `标注 / 参考图 (${msg.media.length})`
                              : `Agent 输出 (${msg.media.length})`)}
                        </Typography.Text>
                        <Button size="small" icon={<DownloadOutlined />}>
                          下载全部
                        </Button>
                      </div>
                      <div className="media-grid">
                        {msg.media.map((asset) => (
                          <MediaThumb key={asset.id} asset={asset} />
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.role === 'assistant' && (
                    <Typography.Link>查看原始数据</Typography.Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
