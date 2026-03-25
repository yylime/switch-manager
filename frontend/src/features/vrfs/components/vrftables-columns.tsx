import { type ColumnDef } from '@tanstack/react-table'
// import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { type VrfPublic as Vrf } from '@/client'


export const switchesColumns: ColumnDef<Vrf>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='VRF' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-124'>
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
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-124'>
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
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-124'>
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
      <DataTableColumnHeader column={column} title='描述' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-124'>
            {row.getValue('description')}
          </span>
        </div>
      )
    },
    enableSorting: false,
  },
]
