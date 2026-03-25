'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'

import { SwitchPublic as Switch } from '@/client'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { ApiError, SwitchesService } from '@/client'
import { handleServerError } from '@/lib/handle-server-error'

type SwitchMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

const CONFIRM_WORD = 'DELETE'

export function SwitchesMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: SwitchMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState('')

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const queryClient = useQueryClient()

  const deleteSwitchesConfigMutation = useMutation({
    mutationFn: (ids: Array<(string)>) => SwitchesService.deleteMultipleSwitches({ requestBody: ids }),
    onSuccess: () => {
      // 让列表重新拉取
      queryClient.invalidateQueries({ queryKey: ['switches'] })
      // 关闭 dialog 并清理当前行
      toast.success('删除交换机成功！')
      table.resetRowSelection()
      setValue('')

    },
    onError: (err: ApiError) => {
      handleServerError(err)
    },
  })

  const handleDelete = () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`)
      return
    }
    const selectedSwitchIds = selectedRows.map(
      (row) => (row.original as Switch).id
    )

    onOpenChange(false)
    deleteSwitchesConfigMutation.mutate(selectedSwitchIds)


  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== CONFIRM_WORD}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          删除 {selectedRows.length}{' '}
          台交换机？
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            确定删除选中的交换机? <br />
            无法撤销该步骤。
          </p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span className=''>确定请输入 "{CONFIRM_WORD}":</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`输入 "${CONFIRM_WORD}" 确定。`}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>警告!</AlertTitle>
            <AlertDescription>
            谨慎操作～
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='删除'
      destructive
    />
  )
}
