import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Inspector } from '../data/schema'

type InspectorsDialogType = 'create' | 'update' | 'delete' | 'import'

type InspectorsContextType = {
  open: InspectorsDialogType | null
  setOpen: (str: InspectorsDialogType | null) => void
  currentRow: Inspector | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Inspector | null>>
}

const InspectorsContext = React.createContext<InspectorsContextType | null>(null)

export function InspectorsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<InspectorsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Inspector | null>(null)

  return (
    <InspectorsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </InspectorsContext.Provider>
  )
}
// eslint-disable-next-line react-refresh/only-export-components
export const useInspectorsContext = () => {
  const inspectorsContext = React.useContext(InspectorsContext)

  if (!inspectorsContext) {
    throw new Error('useInspectorsContext has to be used within <InspectorsContext>')
  }

  return inspectorsContext
}
