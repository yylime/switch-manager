import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { type IPtablePublic as IPTable } from "@/client"
import moment from "moment"

export const ipTablesColumns: ColumnDef<IPTable>[] = [
  {
    accessorKey: 'task_type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='任务类型' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('task_type')}
          </span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'status',

    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status');
      return (
        <div className='flex space-x-2'>
          {status === 'running' ? (
            <Badge variant='outline' className='bg-green-100/30 text-green-900 dark:text-green-200 border-green-200'>
              运行中
            </Badge>
          ) : status === 'success' ? (
            <Badge variant='outline' className='bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-200'>
              已完成
            </Badge>
          ) : status === 'failed' ? (
            <Badge variant='outline' className='bg-red-100/30 text-red-900 dark:text-red-200 border-red-200'>
              失败
            </Badge>
          ) : (
            <Badge variant='outline' className='bg-gray-100/30 text-gray-900 dark:text-gray-200 border-gray-200'>
              {status ? "未知状态" : "-"}
            </Badge>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'message',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='消息' />
    ),
    cell: ({ row }) => {
      const error: string | null = row.getValue('error');
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('message')} {(error ? ` (${error})` : '')}
          </span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'start_time',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='开始时间' />
    ),
    cell: ({ row }) => {
      const start_time = row.getValue('start_time');
      if (!start_time) return '-';
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
             <Badge variant='outline' className='bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-200'>
              {moment(start_time).format("YYYY年MM月DD日 HH:mm:ss")}
            </Badge>
          </span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'end_time',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='结束时间' />
    ),
    cell: ({ row }) => {
      const end_time = row.getValue('end_time');
      if (!end_time) return '-';
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-124'>
            <Badge variant='outline' className='bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-300'>
              {moment(end_time).format("YYYY年MM月DD日 HH:mm:ss")}
            </Badge>
          </span>
        </div>
      )
    },
    enableSorting: false,
  },

]