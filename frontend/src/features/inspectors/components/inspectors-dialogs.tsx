import { showSubmittedData } from '@/lib/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
// import { BranchesImportDialog } from './branches-import-dialog'
import { InspectorMutateDrawer } from './inspectors-mutate-drawer'
import { useInspectorsContext } from './inspectors-provider'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { ApiError, InspectorsService } from '@/client'
import { handleServerError } from '@/lib/handle-server-error'




export function InspectorsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useInspectorsContext()
  // 在组件顶层（InspectorsDialogs）
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
  mutationFn: (id: string) => InspectorsService.deleteInspector({ id }),
  onSuccess: () => {
    // 让列表重新拉取
    queryClient.invalidateQueries({ queryKey: ['inspectors'] })
    // 关闭 dialog 并清理当前行
    setOpen(null)
    setTimeout(() => setCurrentRow(null), 500)
    showSubmittedData(currentRow, 'The following inspector has been deleted:')
  },
  onError: (err: ApiError) => {
    handleServerError (err)
  },
})
  return (
    <>
      <InspectorMutateDrawer
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
          <InspectorMutateDrawer
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
            title={`删除这个巡检账号: ${currentRow.id} ?`}
            desc={
              <>
                你确定删除这个巡检账号{' '} <br />
                用户名: <strong>{currentRow.name}</strong>. <br />
                密码: <strong>{currentRow.password}</strong>. <br />
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
