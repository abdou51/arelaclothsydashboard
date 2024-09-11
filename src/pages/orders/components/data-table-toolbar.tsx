import { Table } from '@tanstack/react-table'
import { Button } from '@/components/custom/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from '../components/data-table-view-options'
import { OrderMetaData } from '../data/schema'
import { useState, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import axios from 'axios'
import { FetchOrdersParams } from '../data/api'
import { Command, CommandGroup, CommandItem } from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  setStatusFilter: (status: string) => void
  setProductFilter: (status: string) => void
  setMultiFilter: (multiFilter: string) => void
  statusFilter: string
  multiFilter: string
  productFilter: object
  fetchOrders: (
    params: FetchOrdersParams
  ) => Promise<{ orders: TData[]; metadata: OrderMetaData }>
}

export function DataTableToolbar<TData>({
  table,
  fetchOrders,
  statusFilter,
  setStatusFilter,
  multiFilter,
  setMultiFilter,
  productFilter,
  setProductFilter,
}: DataTableToolbarProps<TData>) {
  // Data state
  const statuses = [
    'pending',
    'confirmed',
    'cancelled',
    'shipped',
    'delivered',
    'returned',
  ]

  // Ui logic State
  const [open, setOpen] = useState(false)
  const [productNames, setProductNames] = useState([])
  const [openProductFilter, setOpenProductFilter] = useState(false)

  // filter products by name function
  const filterOrdersByFilter = async (event: React.FormEvent) => {
    event.preventDefault()
    fetchOrders({
      page: 1,
      limit: 10,
      status: statusFilter,
      filter: multiFilter,
      product: productFilter._id,
    })
  }

  // Fetch products and set them in setProductFilter
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          'https://api.arelaclothsy.com/products/names'
        )
        const products = response.data
        setProductNames(products)
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <form onSubmit={filterOrdersByFilter}>
          <Input
            placeholder='Filter Orders  (reference , name , wilaya , phones )'
            value={multiFilter}
            onChange={(event) => setMultiFilter(event.target.value)}
            className='h-8 w-[350px] lg:w-[350px]'
          />
        </form>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              role='combobox'
              aria-expanded={open}
              className='w-[200px] justify-between'
            >
              {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) ||
                'Filter By Status...'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-[200px] p-0'>
            <Command>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setStatusFilter('')
                    setOpen(false)
                    fetchOrders({
                      filter: multiFilter,
                      product: productFilter._id,
                    })
                  }}
                >
                  All
                </CommandItem>
              </CommandGroup>
              <CommandGroup>
                {statuses.map((status) => (
                  <CommandItem
                    key={status}
                    onSelect={() => {
                      setStatusFilter(status)
                      setOpen(false)
                      fetchOrders({
                        status: status,
                        filter: multiFilter,
                        product: productFilter._id,
                      })
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        <Popover
          open={openProductFilter}
          onOpenChange={setOpenProductFilter}
          modal={true}
        >
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              role='combobox'
              aria-expanded={openProductFilter}
              className='w-[200px] justify-between'
            >
              {productFilter.engName || 'Filter By Product...'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='h-[450px] w-[200px] overflow-y-auto p-0'>
            <ScrollArea>
              <Command>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setProductFilter({})
                      setOpenProductFilter(false)
                      fetchOrders({
                        filter: multiFilter,
                        product: productFilter._id,
                        status: statusFilter,
                      })
                    }}
                  >
                    All
                  </CommandItem>
                </CommandGroup>
                <CommandGroup>
                  {productNames.map((product) => (
                    <CommandItem
                      key={product._id}
                      onSelect={() => {
                        setProductFilter(product)
                        setOpenProductFilter(false)
                        fetchOrders({
                          status: statusFilter,
                          filter: multiFilter,
                          product: product._id,
                        })
                      }}
                    >
                      {product.engName}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
