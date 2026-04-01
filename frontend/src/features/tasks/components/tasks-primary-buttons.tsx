import { RefreshCwIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function BackupTasksPrimaryButtons() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const queryClient = useQueryClient()
  const handleRefresh = () => {
    // TODO: 实现刷新逻辑
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
    setIsConfirmOpen(false)
    toast.success('数据已刷新')
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
        desc='此操作将重新获取任务列表，可能会消耗一些时间。'
        cancelBtnText='取消'
        confirmText='刷新'
        handleConfirm={handleRefresh}
        className='max-w-md'
      />
    </>
  )
}