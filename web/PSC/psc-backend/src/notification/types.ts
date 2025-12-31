export type QueueStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED';

export interface QueueMessage {
  id: string;
  status: QueueStatus;
  tries?: number;
  noti_created: number;
  recipient: string
}

export interface QueueMeta {
  readOffset: number;
  writeOffset: number;
  totalMessages: number;
  pendingCount: number;
  processingCount: number;
  doneCount: number;
  failedCount: number;
}
