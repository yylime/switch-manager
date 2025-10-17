import { type ColumnDef } from '@tanstack/react-table'
// import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { type Switch } from '../data/schema'
import moment from "moment";

export const switchesColumns: ColumnDef<Switch>[] = [
  {
    accessorKey: 'switch',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Switch' />
    ),
    cell: ({ row }) => {
      const switch_item = row.getValue('switch') as { ip: string; name: string, branch: { name: string } } | null
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {switch_item ? switch_item.name : '-'}
          </span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'ip',
    
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='IP Address' />
    ),
    cell: ({ row }) => {
  
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('ip')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'interface',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Interface' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('interface')}
          </span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'mac',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='MAC address' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('mac')}
          </span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'updated',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Updated at' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <Badge variant='outline' className='bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-200'>
            {moment(row.getValue("updated")).format("YYYY年MM月DD日 HH:mm:ss")}
          </Badge>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'branch',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Branch' />
    ),
    cell: ({ row }) => {
      const switch_item = row.getValue('switch') as { ip: string; name: string, branch: { name: string } } | null
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {switch_item ? switch_item.branch.name : '-'}
          </span>
        </div>
      )
    },
    enableSorting: false,
  },
]
