import React from 'react';
import Badge from './Badge';
import { DOCUMENT_STATUS, STATUS_COLORS } from '../../utils/constants';
import { getStatusLabel } from '../../utils/formatters';

const StatusBadge = ({ status, size = 'md', animated = false, className = '' }) => {
  const mapStatusToVariant = () => {
    switch(status) {
      case DOCUMENT_STATUS.DRAFT: return 'neutral';
      case DOCUMENT_STATUS.PENDING_VERIFICATION: return 'warning';
      case DOCUMENT_STATUS.UNDER_REVIEW: return 'info';
      case DOCUMENT_STATUS.APPROVED: return 'success';
      case DOCUMENT_STATUS.REJECTED: return 'danger';
      case DOCUMENT_STATUS.NOTARIZED: return 'primary';
      default: return 'neutral';
    }
  };

  const isPulse = animated && (status === DOCUMENT_STATUS.PENDING_VERIFICATION || status === DOCUMENT_STATUS.UNDER_REVIEW);

  return (
    <Badge 
      variant={mapStatusToVariant()} 
      size={size} 
      dot={isPulse}
      className={className}
    >
      {getStatusLabel(status)}
    </Badge>
  );
};

export default StatusBadge;
