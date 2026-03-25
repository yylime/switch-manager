import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type BackupScheduler } from '@/client'

type SchedulerDialogType = 'create' | 'update' | 'delete'

type SchedulerContextType = {
  open: SchedulerDialogType | null
  setOpen: (str: SchedulerDialogType | null) => void
  currentRow: BackupScheduler | null
  setCurrentRow: React.Dispatch<React.SetStateAction<BackupScheduler | null>>
}

const SchedulerContext = React.createContext<SchedulerContextType | null>(null)

export function SchedulerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<SchedulerDialogType>(null)
  const [currentRow, setCurrentRow] = useState<BackupScheduler | null>(null)

  return (
    <SchedulerContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </SchedulerContext.Provider>
  )
}
// eslint-disable-next-line react-refresh/only-export-components
export const useSchedulerContext = () => {
  const schedulerContext = React.useContext(SchedulerContext)

  if (!schedulerContext) {
    throw new Error('useSchedulerContext has to be used within <SchedulerContext>')
  }
  return schedulerContext
}
