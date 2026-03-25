import { useState } from 'react'

import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'


import { useTableUrlState } from '@/hooks/use-table-url-state'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { DataTablePagination, DataTableToolbar } from '@/components/data-table'

import { DataTableBulkActions } from './data-table-bulk-actions'
import { switchesColumns as columns } from './switches-columns'
import { useSwitches } from '../data/switches'
import { useBranches } from '../data/switches'
import { getRouteApi } from '@tanstack/react-router'

const route = getRouteApi('/_authenticated/switches/')

export function SwitchesTable() {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    sn: false,
    hardware_type: false,
    software_version: false
  })

  // Local state management for table (uncomment to use local-only state, not synced with URL)
  // const [globalFilter, onGlobalFilterChange] = useState('')
  // const [columnFilters, onColumnFiltersChange] = useState<ColumnFiltersState>([]) // Initialize with branch filter
  // const [pagination, onPaginationChange] = useState<PaginationState>({
  //   pageIndex: 0,
  //   pageSize: 10
  // })

  // Call server API with current URL state (page numbers are 1-based in API)
  // const page = pagination.pageIndex + 1
  // const pageSize = pagination.pageSize
  // const searchText = globalFilter ?? ''

  // Synced with URL states (updated to match route search schema defaults)
  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
  } = useTableUrlState({
    search: route.useSearch(),
    navigate: route.useNavigate(),
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [
      { columnId: 'branch', searchKey: 'branch', type: 'array' },
      { columnId: 'latest_config', searchKey: 'status', type: 'array' },
    ],
  })

  // Extract branch filter if present
  const { data: branchOptions = [], isSuccess: isBranchesSuccess } = useBranches()

  const branchFilter = columnFilters.find(filter => filter.id === 'branch')
  // Handle both single value and array values from filter
  const branchIds: string[] = Array.isArray(branchFilter?.value)
    ? branchFilter.value.map(String)
    : branchFilter?.value
      ? [String(branchFilter.value)]
      : []
  // handle status filter if present
  const statusFilter = columnFilters.find(filter => filter.id === 'latest_config')
  const status: string[] = Array.isArray(statusFilter?.value)
    ? statusFilter.value.map(String)
    : statusFilter?.value
      ? [String(statusFilter.value)]
      : []
  


  const { data: serverData, isLoading } = useSwitches({
    page: pagination.pageIndex + 1,  // Convert to 1-based page number
    pageSize: pagination.pageSize,
    searchText: globalFilter ?? '',
    branchIds: branchIds.length > 0 ? branchIds : [],  // 修改为复数形式，与后端保持一致
    status: status,
  })



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
    getFilteredRowModel: getFilteredRowModel(),  // 用于处理 globalFilter 的全局搜索
    // Use server-driven pagination: provide pageCount and allow manual pagination
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualFiltering: true,
    pageCount: serverPageCount,
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange: onColumnFiltersChange,
  })

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='搜索...'
        filters={[
          {
            columnId: 'branch',
            title: '分址',
            options: isBranchesSuccess ? branchOptions.map(branch => ({ value: branch.value, label: branch.label })) : [],
          },
          {
            columnId: 'latest_config',
            title: '备份状态',
            options: [{ value: 'success', label: '成功' }, { value: 'error', label: '失败' }],
          },
        ]}
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
            {isLoading ? (
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
      <DataTableBulkActions table={table} />
    </div>
  )
}