import { orderSyncText, orderSyncTone } from '../state/orderSync'
import { useOperations } from '../state/OperationsProvider'
import { Notice } from './Notice'

export function OrderSyncNotice() {
  const { orderSync } = useOperations()
  return <Notice tone={orderSyncTone(orderSync)}>{orderSyncText(orderSync)}</Notice>
}
