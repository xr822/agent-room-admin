import { SearchOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Form, Input, Row, Select, Space } from 'antd';
import type { QueryForm } from '../types';

interface QueryRoomCardProps {
  value: QueryForm;
  onChange: (next: QueryForm) => void;
  onSearch: () => void;
  onReset: () => void;
}

export function QueryRoomCard({
  value,
  onChange,
  onSearch,
  onReset,
}: QueryRoomCardProps) {
  return (
    <Card
      className="section-card"
      title={
        <Space>
          <SearchOutlined />
          <span>查询房间</span>
        </Space>
      }
    >
      <Alert
        type="warning"
        showIcon
        className="query-alert"
        title="查询需同时提供应用，以及 room_id / short_link / task_id 三者之一。"
      />

      <Form layout="vertical" className="query-form">
        <Row gutter={[16, 8]}>
          <Col xs={24} sm={12} md={4}>
            <Form.Item label="应用">
              <Select
                value={value.app}
                onChange={(app) => onChange({ ...value, app })}
                options={[
                  { value: 'Virash', label: 'Virash' },
                  { value: 'CapCut', label: 'CapCut' },
                  { value: 'Dreamina', label: 'Dreamina' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Form.Item label="客户端">
              <Select
                value={value.client}
                onChange={(client) => onChange({ ...value, client })}
                options={[
                  { value: 'web', label: 'web' },
                  { value: 'ios', label: 'ios' },
                  { value: 'android', label: 'android' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Form.Item label="room_id">
              <Input
                value={value.roomId}
                placeholder="room_id"
                onChange={(e) => onChange({ ...value, roomId: e.target.value })}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Form.Item label="task_id">
              <Input
                value={value.taskId}
                placeholder="task_id"
                onChange={(e) => onChange({ ...value, taskId: e.target.value })}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="short_link">
              <Input
                value={value.shortLink}
                placeholder="short_link"
                onChange={(e) =>
                  onChange({ ...value, shortLink: e.target.value })
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="query-actions">
          <Space>
            <Button type="primary" onClick={onSearch}>
              搜索
            </Button>
            <Button onClick={onReset}>重置</Button>
            <Button>Debug CURL</Button>
          </Space>
        </div>
      </Form>
    </Card>
  );
}
