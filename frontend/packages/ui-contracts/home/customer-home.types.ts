export type CustomerActionType = 'order' | 'stock' | 'cargo';

export interface CustomerActionCardProps {
  type: CustomerActionType;
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: (type: CustomerActionType) => void;
}

export interface CustomerResultCardProps {
  title: string;
  items: Array<{ label: string; value: string }>;
  status?: 'success' | 'warning' | 'error' | 'info';
  statusText?: string;
}
