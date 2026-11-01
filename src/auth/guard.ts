import type { OperationsAction } from '../domain/operations'
import { requireOwnerProof, type OwnerProof } from './access'

export function guardedDispatch(
  proof: OwnerProof | null,
  dispatch: (action: OperationsAction) => void,
  action: OperationsAction,
): void {
  requireOwnerProof(proof)
  dispatch(action)
}
