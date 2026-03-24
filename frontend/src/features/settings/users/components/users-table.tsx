import { useQuery } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2 } from 'lucide-react'
import useAuth from '@/hooks/use-auth'

import { UsersService } from '@/client'
import { useUsersContext } from './users-provider'

export function UsersTable() {

  const { user: currentUser } = useAuth()

  const { setOpen, setCurrentRow } = useUsersContext()

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => UsersService.readUsers(),
  })

  if (isLoading) {
    return <div className='flex justify-center py-8'>加载中...</div>
  }

  return (
    <div className='rounded-lg border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>邮箱</TableHead>
            <TableHead>用户名</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>超级管理员</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usersData?.data?.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.full_name || '-'}</TableCell>
              <TableCell>
                {
                  user.is_active ? (
                    <span className='inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800'>
                      活跃
                    </span>
                  ) : (
                    <span className='inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800'>
                      禁用
                    </span>
                  )
                }
              </TableCell>
              <TableCell>
                {user.is_superuser ? (
                  <span className='text-sm font-semibold text-orange-600'>是</span>
                ) : (
                  <span className='text-sm text-muted-foreground'>否</span>
                )}
              </TableCell>
              <TableCell>
                {currentUser?.is_superuser && user.id !== currentUser.id && (
                  <div className='flex'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        setCurrentRow(user)
                        setOpen('update')
                      }}
                    >
                      <Edit2 className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        setCurrentRow(user)
                        setOpen('delete')
                      }}
                    >
                      <Trash2 className='h-4 w-4 text-red-500' />
                    </Button>
                  </div>

                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
