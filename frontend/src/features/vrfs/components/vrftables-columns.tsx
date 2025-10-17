import { type ColumnDef } from '@tanstack/react-table'
// import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Vrf } from '../data/schema'

export const switchesColumns: ColumnDef<Vrf>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vrf Name' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('name')}
          </span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'rd',
    
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Route Distinguisher' />
    ),
    cell: ({ row }) => {
  
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('rd')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'rt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Route Target' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('rt')}
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
]
