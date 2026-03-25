import { RefreshCwIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useState } from 'react'
import { ApiError, IptablesService } from '@/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'

export function IptablesPrimaryButtons() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const queryClient = useQueryClient()

  const refreshMutation = useMutation({
    mutationFn: () => IptablesService.flushIptablesBackground(),
    onSuccess: () => {
      toast.success('后台刷新中，请稍后查看')
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['iptables'] })
      }, 2) // 2秒后再重新拉取
    },
    onError: (err: ApiError) => {
      handleServerError(err)
    },
  })
  const handleRefresh = () => {
    // TODO: 实现刷新逻辑
    refreshMutation.mutate()
    setIsConfirmOpen(false)
  }

  return (
    <>
      <div className='flex gap-2'>
        <Button className='space-x-1' onClick={() => setIsConfirmOpen(true)}>
          <span>刷新</span> <RefreshCwIcon size={18} />
        </Button>
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title='确认刷新数据？'
        desc='此操作将重新获取iptables表数据，可能会消耗一些时间。'
        cancelBtnText='取消'
        confirmText='刷新'
        handleConfirm={handleRefresh}
        className='max-w-md'
      />
    </>
  )
}