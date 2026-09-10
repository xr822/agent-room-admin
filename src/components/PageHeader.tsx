import {
  HomeOutlined,
  MenuFoldOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Select, Space, Typography } from 'antd';

interface PageHeaderProps {
  listIndex?: number;
  listTotal?: number;
}

export function PageHeader({ listIndex = 1, listTotal = 117 }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header-left">
        <Button type="text" icon={<MenuFoldOutlined />} />
        <Button type="text" icon={<HomeOutlined />} />
        <div className="page-title-block">
          <Typography.Title level={4} className="page-title">
            房间详情
          </Typography.Title>
          <Typography.Text type="secondary" className="page-subtitle">
            查看会话内容与服务端执行流程，支持 room_id / task_id / short_link 查询
          </Typography.Text>
        </div>
      </div>

      <div className="page-header-right">
        <Select
          defaultValue="Release"
          style={{ width: 110 }}
          options={[
            { value: 'Release', label: 'Release' },
            { value: 'Staging', label: 'Staging' },
            { value: 'Dev', label: 'Dev' },
          ]}
        />
        <Select
          defaultValue="v3"
          style={{ width: 140 }}
          options={[
            { value: 'v3', label: 'Agent 中台-V3' },
            { value: 'v2', label: 'Agent 中台-V2' },
          ]}
        />
        <Space size={8} className="user-chip">
          <Avatar size={28} icon={<UserOutlined />} style={{ background: '#1677ff' }} />
          <span>杨馨然</span>
        </Space>
        <Space size={8} className="list-pager">
          <Typography.Text type="secondary">
            列表 {listIndex}/{listTotal}
          </Typography.Text>
          <Button size="small">上一个</Button>
          <Button size="small">下一个</Button>
        </Space>
      </div>
    </header>
  );
}
