import { ShareAltOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Space, Tag, Typography, message } from 'antd';
import type { ReactNode } from 'react';
import type { RoomInfo } from '../types';

interface RoomInfoCardProps {
  room: RoomInfo;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="info-field">
      <span className="info-label">{label}</span>
      <div className="info-value">{children}</div>
    </div>
  );
}

export function RoomInfoCard({ room }: RoomInfoCardProps) {
  return (
    <Card className="section-card" title="任务会话信息">
      <Row gutter={[24, 16]}>
        <Col xs={24} md={8}>
          <Field label="归属应用">{room.app}</Field>
        </Col>
        <Col xs={24} md={8}>
          <Field label="房间类型">{room.roomType}</Field>
        </Col>
        <Col xs={24} md={8}>
          <Field label="房间状态">
            <Tag color="success">{room.status}</Tag>
          </Field>
        </Col>

        <Col span={24}>
          <Field label="room_id">
            <Space wrap>
              <Typography.Text code copyable>
                {room.roomId}
              </Typography.Text>
              <Button
                size="small"
                icon={<ShareAltOutlined />}
                onClick={() => message.success('已复制分享链接')}
              >
                分享
              </Button>
              <Button size="small" className="btn-purple">
                对话日志
              </Button>
            </Space>
          </Field>
        </Col>

        <Col xs={24} md={8}>
          <Field label="UID">{room.uid}</Field>
        </Col>
        <Col xs={24} md={8}>
          <Field label="gid">
            <Typography.Text ellipsis style={{ maxWidth: 260 }} copyable>
              {room.gid}
            </Typography.Text>
          </Field>
        </Col>
        <Col xs={24} md={8}>
          <Field label="client_id">{room.clientId}</Field>
        </Col>

        <Col xs={24} md={8}>
          <Field label="创建时间">{room.createdAt}</Field>
        </Col>
        <Col xs={24} md={8}>
          <Field label="是否保存">
            <Space>
              <Tag>{room.saved ? '已保存' : '未保存'}</Tag>
              <Typography.Link>最近记录</Typography.Link>
            </Space>
          </Field>
        </Col>
        <Col xs={24} md={8}>
          <Field label="房间标题">{room.title}</Field>
        </Col>
      </Row>

      <div className="credit-panel">
        <Typography.Text strong>权益代币</Typography.Text>
        <Row gutter={[16, 8]} className="credit-grid">
          <Col xs={12} md={6}>
            <Field label="扣减合计">{room.credit.deductTotal}</Field>
          </Col>
          <Col xs={12} md={6}>
            <Field label="回退合计">{room.credit.refundTotal}</Field>
          </Col>
          <Col xs={12} md={6}>
            <Field label="真实扣减">{room.credit.realDeduct}</Field>
          </Col>
          <Col xs={12} md={6}>
            <Field label="后台手动回退">
              {room.credit.manualRefund ?? '-'}
            </Field>
          </Col>
        </Row>
      </div>
    </Card>
  );
}
