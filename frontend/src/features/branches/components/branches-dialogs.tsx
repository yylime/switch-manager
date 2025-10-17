import { showSubmittedData } from '@/lib/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { BranchesImportDialog } from './branches-import-dialog'
import { BranchMutateDrawer } from './branches-mutate-drawer'
import { useBranchesContext } from './branches-provider'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { BranchesService } from '@/client'
import { toast } from 'sonner'




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
    showSubmittedData(currentRow, 'The following branch has been deleted:')
  },
  onError: (err) => {
    // 可用 toast 显示错误
    toast.error(err.message)
  },
})
  return (
    <>
      <BranchMutateDrawer
        key='branch-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      <BranchesImportDialog
        key='branches-import'
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
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
            title={`Delete this task: ${currentRow.id} ?`}
            desc={
              <>
                You are about to delete a task with the name{' '}
                <strong>{currentRow.name}</strong>. <br />
                This action cannot be undone.
              </>
            }
            confirmText='Delete'
          />
        </>
      )}
    </>
  )
}
