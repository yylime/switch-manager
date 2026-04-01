import { useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'

import { useTableUrlState } from '@/hooks/use-table-url-state'
import { ipTablesColumns as columns } from './tasks-columns'
import { useTasktables } from '../data/tasks'
import { getRouteApi } from '@tanstack/react-router'
const route = getRouteApi('/_authenticated/tasks/')

export function TaskTable() {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
  })

  // Local state management for table (uncomment to use local-only state, not synced with URL)
  // const [globalFilter, onGlobalFilterChange] = useState('')
  // const [columnFilters, onColumnFiltersChange] = useState<ColumnFiltersState>([])
  // const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  // Reset pagination to first page when global filter changes
  // useEffect(() => {
  //   setPagination(prev => ({ ...prev, pageIndex: 0 }))
  // }, [globalFilter])

  // Call server API with current URL state (page numbers are 1-based in API)
  // const page = pagination.pageIndex + 1
  // const pageSize = pagination.pageSize
  // const searchText = globalFilter ?? ''
  const { globalFilter, onGlobalFilterChange, pagination, onPaginationChange, columnFilters, onColumnFiltersChange } = useTableUrlState({
    search: route.useSearch(),
    navigate: route.useNavigate(),
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [
      { columnId: 'status', searchKey: 'status', type: 'array' },
    ],

  })

  const statusFilter = columnFilters.find(filter => filter.id === 'status')
  const status: string[] = Array.isArray(statusFilter?.value)
    ? statusFilter.value.map(String)
    : statusFilter?.value
      ? [String(statusFilter.value)]
      : []

  console.log(status)

  const { data: serverData, isFetching } = useTasktables({ page: pagination.pageIndex + 1, pageSize: pagination.pageSize, searchText: globalFilter ?? '', status: status.length > 0 ? status : [] })

  // If useSwitches supports params, call useSwitches({ page, pageSize, searchText: globalFilter })
  // For now use returned data and count
  // serverData expected shape: { data: Switch[], count: number }
  const rows = (serverData as any)?.data ?? []
  const totalCount = (serverData as any)?.count ?? 0
  const serverPageCount = Math.max(1, Math.ceil(totalCount / pagination.pageSize))

  const table = useReactTable({
    data: rows,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // Use server-driven pagination: provide pageCount and allow manual pagination
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualFiltering: true,
    pageCount: serverPageCount,
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange: onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange: onColumnFiltersChange,

  })



  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Filter by name ...'
        filters={
          [
            {
              columnId: 'status',
              options: [
                { label: '运行中', value: 'running' },
                { label: '已完成', value: 'success' },
                { label: '失败', value: 'failed' },
              ],
              title: '状态',
            },
          ]
        }
      />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}