import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { type Switch } from '../data/schema'
import moment from "moment"

export const switchesColumns: ColumnDef<Switch>[] = [
  {
    accessorKey: 'switch',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Switch' />
    ),
    cell: ({ row }) => {
      const switch_item = row.original.switch;
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
      const ip = row.original.ip;
      const mask = row.original.mask;
      return (
        <div className='flex space-x-2'>
          {ip && <Badge variant='default'>{ip}</Badge>}
          {mask !== undefined && <Badge variant='secondary'>{mask}</Badge>}
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
    accessorKey: 'vrf',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='VRF' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('vrf') || '-'}
          </span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'acl',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ACL' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('acl') || '-'}
          </span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'updated',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Timestamp' />
    ),
    cell: ({ row }) => {
      const updated = row.original.updated;
      if (!updated) return '-';
      return (
        <div className='flex space-x-2'>
          <Badge variant='outline' className='bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-200'>
            {moment(updated).format("YYYY年MM月DD日 HH:mm:ss")}
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
      const switch_item = row.original.switch;
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