
export interface OrderItem {
  name: string;
  quantity: number;
  notes?: string;
}

export interface WaiterRequest {
  id: string;
  tableNumber: string;
  timestamp: number;
  message: string;
  type: 'service' | 'order' | 'review';
  items?: OrderItem[];
}

export enum AppState {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  LISTENING = 'LISTENING',
  SPEAKING = 'SPEAKING',
  ERROR = 'ERROR'
}
