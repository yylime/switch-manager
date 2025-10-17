import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Switch } from '../data/schema'

type SwitchesDialogType = 'create' | 'update' | 'delete' | 'import' | 'update_config'

type SwitchesContextType = {
  open: SwitchesDialogType | null
  setOpen: (str: SwitchesDialogType | null) => void
  currentRow: Switch | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Switch | null>>
}

const SwitchesContext = React.createContext<SwitchesContextType | null>(null)

export function SwitchesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<SwitchesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Switch | null>(null)

  return (
    <SwitchesContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </SwitchesContext.Provider>
  )
}
// eslint-disable-next-line react-refresh/only-export-components
export const useSwitchesContext = () => {
  const switchesContext = React.useContext(SwitchesContext)

  if (!switchesContext) {
    throw new Error('useSwitchesContext has to be used within <SwitchesContext>')
  }

  return switchesContext
}
