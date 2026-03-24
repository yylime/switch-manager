import { showSubmittedData } from '@/lib/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
// import { BranchesImportDialog } from './branches-import-dialog'
import { SchedulerMutateDrawer } from './scheduler-mutate-drawer'
import { useSchedulerContext } from './scheduler-provider'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { ApiError, ScheduleService } from '@/client'
import { handleServerError } from '@/lib/handle-server-error'




export function SchedulerDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useSchedulerContext()
  // 在组件顶层（SchedulerDialogs）
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
  mutationFn: (id: string) => ScheduleService.deleteBackupJob({ id }),
  onSuccess: () => {
    // 让列表重新拉取
    queryClient.invalidateQueries({ queryKey: ['schedulers'] })
    // 关闭 dialog 并清理当前行
    setOpen(null)
    setTimeout(() => setCurrentRow(null), 500)
    showSubmittedData(currentRow, '这个定时任务已经被删除！')
  },
  onError: (err: ApiError) => {
    handleServerError (err)
  },
})
  return (
    <>
      <SchedulerMutateDrawer
        key='branch-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      {/* <BranchesImportDialog
        key='branches-import'
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
      /> */}

      {currentRow && (
        <>
          <SchedulerMutateDrawer
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
              deleteMutation.mutate(currentRow.id ?? "")
            }}
            className='max-w-md'
            title={`删除这个定时任务账号: ${currentRow.id} ?`}
            desc={
              <>
                你确定删除这个定时任务{' '} <br />
                任务: <strong>{currentRow.name}</strong>. <br />
                类型: <strong>{currentRow.job_type}</strong>. <br />
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
