import { ConfirmDialog } from '@/components/confirm-dialog'
import { UserMutateDrawer } from './users-mutate-drawer'

import { useQueryClient, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ApiError, UsersService } from '@/client'
import { handleServerError } from '@/lib/handle-server-error'
import { useUsersContext } from './users-provider'

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUsersContext()
  const queryClient = useQueryClient()



  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => UsersService.deleteUser({ userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setOpen(null)
      setTimeout(() => setCurrentRow(null), 500)
      toast.success('用户删除成功')
    },
    onError: (err: ApiError) => {
      handleServerError(err)
    },
  })

  return (
    <>
      {/* 创建用户对话框 */}
      <UserMutateDrawer
        key='user-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />


      {/* 删除确认对话框 */}
      {currentRow && (

        <>
          <UserMutateDrawer
            key={`user-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='user-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            handleConfirm={() => {
              if (!currentRow) return
              deleteUserMutation.mutate(currentRow.id)
            }}
            className='max-w-md'
            title={`删除这个用户: ${currentRow.id} ?`}
            desc={
              <>
                你即将删除一名名为 <strong>{currentRow.full_name}</strong> 的用户。 <br />
                此操作无法撤销。
              </>
            }
            cancelBtnText='取消'
            confirmText='删除'
          />
        </>
      )}
    </>
  )
}
