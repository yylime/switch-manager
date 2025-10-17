import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
// import priorities/statuses if bulk filters are enabled
import { Switch } from '../data/schema'
import { SwitchesMultiDeleteDialog } from './switches-multi-delete-dialog'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { SwitchesService } from '@/client'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const queryClient = useQueryClient()

  // bulk status/priority actions are currently disabled; implement if needed

  const updateSwitchesConfigMutation = useMutation({
    mutationFn: (ids: Array<(string)>) => SwitchesService.backupMultipleSwitches({ requestBody: ids }),
    onSuccess: () => {
      // 让列表重新拉取
      queryClient.invalidateQueries({ queryKey: ['switches'] })
      // 关闭 dialog 并清理当前行
      toast.success('配置正在后台备份请稍后查看')
    },
    onError: (err) => {
      // 可用 toast 显示错误
      toast.error(err.message)
    },
  })

  const handleBulkExport = () => {
    const selectedSwitchIds = selectedRows.map(
      (row) => (row.original as Switch).id
    )
    updateSwitchesConfigMutation.mutate(selectedSwitchIds)
    table.resetRowSelection()
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='branch'>
        {/* <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='size-8'
                  aria-label='Update status'
                  title='Update status'
                >
                  <CircleArrowUp />
                  <span className='sr-only'>Update status</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Update status</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent sideOffset={14}>
            {statuses.map((status) => (
              <DropdownMenuItem
                key={status.value}
                defaultValue={status.value}
                onClick={() => handleBulkStatusChange(status.value)}
              >
                {status.icon && (
                  <status.icon className='text-muted-foreground size-4' />
                )}
                {status.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='size-8'
                  aria-label='Update priority'
                  title='Update priority'
                >
                  <ArrowUpDown />
                  <span className='sr-only'>Update priority</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Update priority</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent sideOffset={14}>
            {priorities.map((priority) => (
              <DropdownMenuItem
                key={priority.value}
                defaultValue={priority.value}
                onClick={() => handleBulkPriorityChange(priority.value)}
              >
                {priority.icon && (
                  <priority.icon className='text-muted-foreground size-4' />
                )}
                {priority.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu> */}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkExport()}
              className='size-8'
              aria-label='update switches configuration'
              title='update switches configuration'
            >
              <RefreshCw />
              <span className='sr-only'>同步配置</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>同步配置</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='Delete selected switches'
              title='Delete selected switches'
            >
              <Trash2 />
              <span className='sr-only'>Delete selected switches</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected switches</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <SwitchesMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        table={table}
      />
    </>
  )
}
