import { VideoCameraOutlined } from '@ant-design/icons';
import { App as AntApp, ConfigProvider, FloatButton, message } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useState } from 'react';
import { ConversationFlowCard } from './components/ConversationFlowCard';
import { PageHeader } from './components/PageHeader';
import { QueryRoomCard } from './components/QueryRoomCard';
import { RoomInfoCard } from './components/RoomInfoCard';
import { defaultQuery, roomInfo } from './data/mock';
import type { QueryForm } from './types';
import './App.css';

function RoomDetailPage() {
  const [query, setQuery] = useState<QueryForm>(defaultQuery);
  const [room, setRoom] = useState(roomInfo);

  const handleSearch = () => {
    if (!query.roomId && !query.taskId && !query.shortLink) {
      message.warning('请填写 room_id / task_id / short_link 之一');
      return;
    }
    setRoom({
      ...roomInfo,
      app: query.app,
      clientId: query.client,
      roomId: query.roomId || roomInfo.roomId,
    });
    message.success('查询成功（演示数据）');
  };

  const handleReset = () => {
    setQuery(defaultQuery);
    setRoom(roomInfo);
  };

  return (
    <div className="page-shell">
      <PageHeader />
      <main className="page-main">
        <QueryRoomCard
          value={query}
          onChange={setQuery}
          onSearch={handleSearch}
          onReset={handleReset}
        />
        <RoomInfoCard room={room} />
        <ConversationFlowCard room={room} />
      </main>

      <FloatButton
        type="primary"
        icon={<VideoCameraOutlined />}
        content="泳道视图"
        shape="square"
        className="swimlane-fab"
        onClick={() => message.info('泳道视图（演示）')}
      />
    </div>
  );
}

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
        },
      }}
    >
      <AntApp>
        <RoomDetailPage />
      </AntApp>
    </ConfigProvider>
  );
}
