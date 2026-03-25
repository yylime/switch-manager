import { showSubmittedData } from '@/lib/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { BranchMutateDrawer } from './branches-mutate-drawer'
import { useBranchesContext } from './branches-provider'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { ApiError, BranchesService } from '@/client'
import { handleServerError } from '@/lib/handle-server-error'



export function BranchesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useBranchesContext()
  // 在组件顶层（BranchesDialogs）
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
  mutationFn: (id: string) => BranchesService.deleteBranch({ id }),
  onSuccess: () => {
    // 让列表重新拉取
    queryClient.invalidateQueries({ queryKey: ['branches'] })
    // 关闭 dialog 并清理当前行
    setOpen(null)
    setTimeout(() => setCurrentRow(null), 500)
    showSubmittedData(currentRow, '如下分址已被删除:')
  },
  onError: (err: ApiError) => {
    handleServerError(err)
  },
})
  return (
    <>
      <BranchMutateDrawer
        key='branch-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />


      {currentRow && (
        <>
          <BranchMutateDrawer
            key={`branch-update-${currentRow.id}`}
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
            key='branch-delete'
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
              deleteMutation.mutate(currentRow.id)
            }}
            className='max-w-md'
            title={`删除: ${currentRow.id} ?`}
            desc={
              <>
                你确定删除名为{' '}
                <strong>{currentRow.name}</strong> 的分址？ <br />
                这个操作不可逆.
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
