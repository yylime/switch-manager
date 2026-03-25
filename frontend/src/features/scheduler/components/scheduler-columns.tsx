import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
// import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'

import { type BackupScheduler as Scheduler } from '@/client'
import { DataTableRowActions } from './data-table-row-actions'
import moment from 'moment'

export const SchedulerColumns: ColumnDef<Scheduler>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => {
      const id = row.getValue('id') as string
      return <div className='max-w-40'>{id.slice(0, 8)}</div>
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='任务名' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:The class `md:max-w-[31rem]` can be written as `md:max-w-124`'>
            {row.getValue('name')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'job_type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='任务类型' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-124'>
            {row.getValue('job_type')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'cron',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='定时' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-124'>
            {row.getValue('cron')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'enabled',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-124'>

            {row.getValue('enabled') ? (
              <Badge className='bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'>启用</Badge>
            ) : (
              <Badge className='bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10'>停用</Badge>
            )}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='创建时间' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-124'>
            <Badge variant='outline' className='bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-200'>
              {moment(row.getValue("created_at"), moment.ISO_8601, true).isValid()
                ? moment(row.getValue("created_at")).format("YYYY年MM月DD日 HH:mm:ss")
                : '-'}
            </Badge>
          </span>
        </div>
      )
    },
  },

  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
