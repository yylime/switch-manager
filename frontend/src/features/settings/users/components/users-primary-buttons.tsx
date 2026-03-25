import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUsersContext } from './users-provider'

export function UsersPrimaryButtons() {
  const { setOpen } = useUsersContext()
  return (
    <Button
      className='space-x-1'
      onClick={() => {
        setOpen('create')
      }}
    >
      <span>创建用户</span> <Plus size={18} />
    </Button>
  )
}
