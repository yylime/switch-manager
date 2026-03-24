import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import {type UserPublic as User } from '@/client'



type UsersDialogType = 'create' | 'delete' | 'update'

type UsersContextType = {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: User | null
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>
}

const UsersContext = React.createContext<UsersContextType | null>(null)

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<User | null>(null)

  return (
    <UsersContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </UsersContext.Provider>
  )
}

export const useUsersContext = () => {
  const usersContext = React.useContext(UsersContext)

  if (!usersContext) {
    throw new Error('useUsersContext has to be used within <UsersContext>')
  }

  return usersContext
}
