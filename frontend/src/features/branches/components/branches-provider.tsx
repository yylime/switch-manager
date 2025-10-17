import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Branch } from '../data/schema'

type BranchesDialogType = 'create' | 'update' | 'delete' | 'import'

type BranchesContextType = {
  open: BranchesDialogType | null
  setOpen: (str: BranchesDialogType | null) => void
  currentRow: Branch | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Branch | null>>
}

const BranchesContext = React.createContext<BranchesContextType | null>(null)

export function BranchesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<BranchesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Branch | null>(null)

  return (
    <BranchesContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </BranchesContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
// eslint-disable-next-line react-refresh/only-export-components
export const useBranchesContext = () => {
  const branchesContext = React.useContext(BranchesContext)

  if (!branchesContext) {
    throw new Error('useBranchesContext has to be used within <BranchesContext>')
  }

  return branchesContext
}
