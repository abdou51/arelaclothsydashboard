import * as React from 'react'
import { useState } from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
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

import { DataTablePagination } from '../components/data-table-pagination'
import { OrderMetaData } from '../data/schema'
import { DataTableToolbar } from './data-table-toolbar'
import { FetchOrdersParams } from '../data/api'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  metadata: OrderMetaData | null // Allow metadata to be null
  loading: boolean
  error: string | null
  fetchOrders: (
    params: FetchOrdersParams
  ) => Promise<{ orders: TData[]; metadata: OrderMetaData }>
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading,
  error,
  metadata,
  fetchOrders,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )

  // category and name filter State inside data table toolbar
  const [statusFilter, setStatusFilter] = useState('')
  const [productFilter, setProductFilter] = useState({})
  const [multiFilter, setMultiFilter] = useState('')

  const [sorting, setSorting] = React.useState<SortingState>([])
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  // Define color mappings for light and dark themes

  const darkThemeColors: Record<string, string> = {
    pending: '#FFA500', // Orange
    confirmed: '#4CAF50', // Green
    cancelled: '#FF0000', // Red
    shipped: '#1E90FF', // Dodger Blue
    delivered: '#008000', // Dark Green
    returned: '#800080', // Purple
  }

  const lightThemeColors: Record<string, string> = {
    pending: '#FFB84D', // Lighter Orange
    confirmed: '#81C784', // Lighter Green
    cancelled: '#E57373', // Lighter Red
    shipped: '#64B5F6', // Lighter Blue
    delivered: '#66BB6A', // Lighter Dark Green
    returned: '#BA68C8', // Lighter Purple
  }

  // Get the current theme from localStorage
  const theme = localStorage.getItem('vite-ui-theme') || 'light'

  // Use the appropriate color map based on the theme
  const statusColorMap = theme === 'dark' ? darkThemeColors : lightThemeColors

  return (
    <div className='space-y-4'>
      <DataTableToolbar
        table={table}
        fetchOrders={fetchOrders}
        setStatusFilter={setStatusFilter}
        statusFilter={statusFilter}
        setMultiFilter={setMultiFilter}
        multiFilter={multiFilter}
        setProductFilter={setProductFilter}
        productFilter={productFilter}
      />
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  Error: {error}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => {
                // Get the status of the current row
                const status = row.getValue('status') as string

                // Get the corresponding color for the status
                const backgroundColor = statusColorMap[status] || 'transparent'

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? 'selected' : undefined}
                    style={{ backgroundColor }} // Apply the background color
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className=''>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
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
      <DataTablePagination
        statusFilter={statusFilter}
        table={table}
        metadata={metadata}
        fetchOrders={fetchOrders}
        multiFilter={multiFilter}
        productFilter={productFilter._id}
      />
    </div>
  )
}
