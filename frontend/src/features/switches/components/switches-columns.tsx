import { type ColumnDef } from '@tanstack/react-table'
// import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { type Switch } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { callTypes } from '../data/data'
import moment from "moment";
import { Link } from '@tanstack/react-router'

export const switchesColumns: ColumnDef<Switch>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <Link
            to="/switches/$switchId"
            params={{
              switchId: row.original.id.toString()
            }}
          >
            <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem] hover:text-primary hover:underline'>
              {row.getValue('name')}
            </span>
          </Link>
        </div>
      )
    },
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
    accessorKey: 'stack_num',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Stack' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('stack_num')}
          </span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'stype',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Operating System' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('stype')}
          </span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'latest_config',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Backup Status' />
    ),
    cell: ({ row }) => {
      const latestConfig = row.getValue('latest_config') as { status: string; updated: string } | null
      const badgeColor = callTypes.get(latestConfig?.status as 'success' | 'error')
      return (
        <div className='flex space-x-2'>
          <Badge variant='outline' className={cn('capitalize', badgeColor)}>
            {latestConfig ? latestConfig.status : '-'}
          </Badge>
          <Badge variant='outline' className='bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-200'>
            {moment(latestConfig?.updated, moment.ISO_8601, true).isValid()
              ? moment(latestConfig?.updated).format("YYYY年MM月DD日 HH:mm:ss")
              : '-'}
          </Badge>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'hardware_type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Hardware Type' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('hardware_type')}
          </span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'software_version',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Software Version' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('software_version')}
          </span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'sn',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Serial Number' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('sn')}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'branch',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Branch' />
    ),
    cell: ({ row }) => {
      const branch = row.getValue('branch') as { id: string; name: string } | null
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {branch ? branch.name : '-'}
          </span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('description')}
          </span>
        </div>
      )
    },
    enableSorting: false,
  },


  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
