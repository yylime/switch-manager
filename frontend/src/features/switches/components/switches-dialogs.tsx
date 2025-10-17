import { showSubmittedData } from '@/lib/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { SwitchesImportDialog } from './switches-import-dialog'
import { SwitchMutateDrawer } from './switches-mutate-drawer'
import { useSwitchesContext } from './switches-provider'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { SwitchesService } from '@/client'
import { toast } from 'sonner'



export function SwitchesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useSwitchesContext()
  // 在组件顶层（SwitchesDialogs）
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => SwitchesService.deleteSwitch({ id }),
    onSuccess: () => {
      // 让列表重新拉取
      queryClient.invalidateQueries({ queryKey: ['switches'] })
      // 关闭 dialog 并清理当前行
      setOpen(null)
      setTimeout(() => setCurrentRow(null), 500)
      showSubmittedData(currentRow, 'The following switch has been deleted:')
    },
    onError: (err) => {
      // 可用 toast 显示错误
      toast.error(err.message)
    },
  })
  
  const updateSwitchConfigMutation = useMutation({
    mutationFn: (id: string) => SwitchesService.backupSwitch({ id }),
    onSuccess: () => {
      // 让列表重新拉取
      queryClient.invalidateQueries({ queryKey: ['switches'] })
      // 关闭 dialog 并清理当前行
      setOpen(null)
      toast.success('配置正在后台备份请稍后查看')
    },
    onError: (err) => {
      // 可用 toast 显示错误
      toast.error(err.message)
    },
  })

  return (
    <>
      <SwitchMutateDrawer
        key='branch-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      <SwitchesImportDialog
        key='branches-import'
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
      />

      {currentRow && (
        <>
          <SwitchMutateDrawer
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
            key='switch-config-update'
            destructive
            open={open === 'update_config'}
            onOpenChange={() => {
              setOpen('update_config')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            handleConfirm={() => {
              if (!currentRow) return
              updateSwitchConfigMutation.mutate(currentRow.id)
            }}
            className='max-w-md'
            title={`同步现网交换机: ${currentRow.name} 配置?`}
            desc={
              <>
                你确定立即同步此台交换机配置吗？{' '}
                <strong>{currentRow.name}</strong>. <br />
                此操作无法撤销。
              </>
            }
            cancelBtnText='取消'
            confirmText='更新配置'
          />

          <ConfirmDialog
            key='switch-delete'
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
            title={`Delete this switch: ${currentRow.id} ?`}
            desc={
              <>
                You are about to delete a switch with the name{' '}
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
