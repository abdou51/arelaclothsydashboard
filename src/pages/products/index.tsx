import ThemeSwitch from '@/components/theme-switch'
import { UserNav } from '@/components/user-nav'
import { Layout, LayoutBody, LayoutHeader } from '@/components/custom/layout'
import { DataTable } from './components/data-table'
import { fetchProducts } from './data/api'
import { useState, useEffect } from 'react'
import { Category, Product, ProductMetadata } from './data/schema'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from './components/data-table-column-header'
import { DataTableRowActions } from './components/data-table-row-actions'
import { Button } from '@/components/custom/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import axios from 'axios'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { Command, CommandGroup, CommandItem } from '@/components/ui/command'
import { fetchCategories } from '../categories/data/api'

interface FetchProductsParams {
  page?: number
  limit?: number
  category?: string
}

export default function DeliveryPricing() {
  const handleSubmit = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('jwt')

      const formData = new FormData()
      selectedAddImages.forEach((file) => {
        formData.append('images', file) // Append file directly
      })

      const imageResponse = await axios.post(
        'https://api.arelaclothsy.com/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const imagesWithId = imageResponse.data._id

      const productData = {
        frName: selectedAddFrName,
        engName: selectedAddEngName,
        arName: selectedAddArName,
        price: selectedAddPrice,
        frDescription: selectedAddFrDescription,
        engDescription: selectedAddEnDescription,
        arDescription: selectedAddArDescription,
        category: selectedAddCategory?._id,
        images: imagesWithId,
        sizes: selectedAddSizes,
        new: selectedAddNew,
        bestSelling: selectedAddBestSelling,
        salePrice: selectedAddSalePrice,
        saleEnds: selectedAddSaleEnds,
        isSale: promotion,
      }

      const response = await axios.post(
        'https://api.arelaclothsy.com/products',
        productData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('Product created successfully:', response.data)
      loadProducts()
      setLoading(false)
      setOpenDialog(false)
    } catch (error) {
      console.error('Error creating product:', error)
      setError('Failed to submit product data')
      setLoading(false)
      setOpenDialog(false)
    }
  }

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'frName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='French Name' />
      ),
      cell: ({ row }) => <div>{row.getValue('frName')}</div>,
      enableSorting: false,
    },
    {
      accessorKey: 'arName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Arabic Name' />
      ),
      cell: ({ row }) => <div>{row.getValue('arName')}</div>,
      enableSorting: false,
    },
    {
      accessorKey: 'engName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='English Name' />
      ),
      cell: ({ row }) => <div>{row.getValue('engName')}</div>,
      enableSorting: false,
    },
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Price' />
      ),
      cell: ({ row }) => <div>{row.getValue('price')} Dzd</div>,
      enableSorting: false,
    },
    {
      accessorKey: 'category',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Category' />
      ),
      cell: ({ row }) => <div>{row.original.category.engName}</div>,
      enableSorting: false,
    },

    {
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Action' />
      ),
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          deleteProduct={deleteProduct}
          updateProduct={updateProduct}
          categories={categories}
        />
      ),
    },
  ]

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    setSelectedAddImages(files)
  }

  const updateProduct = (updatedProduct: Product) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product._id === updatedProduct._id ? updatedProduct : product
      )
    )
  }

  const deleteProduct = (deletedProduct: Product) => {
    setProducts((currentProducts) =>
      currentProducts.filter((product) => product._id !== deletedProduct._id)
    )
  }

  // api functionality state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ui logic state
  const [openDialog, setOpenDialog] = useState(false)
  const [openCombobox, setOpenCombobox] = useState(false)

  // data api state
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [metadata, setMetadata] = useState<ProductMetadata | null>(null)

  // add product state
  const [selectedAddCategory, setSelectedAddCategory] = useState<Category>()
  const [selectedAddFrName, setSelectedAddFrName] = useState('')
  const [selectedAddEngName, setSelectedAddEngName] = useState('')
  const [selectedAddArName, setSelectedAddArName] = useState('')
  const [selectedAddPrice, setSelectedAddPrice] = useState(0)
  const [selectedAddFrDescription, setSelectedAddFrDescription] = useState('')
  const [selectedAddEnDescription, setSelectedAddEnDescription] = useState('')
  const [selectedAddArDescription, setSelectedAddArDescription] = useState('')
  const [selectedAddImages, setSelectedAddImages] = useState<File[]>([])
  const [selectedAddSizes, setSelectedAddSizes] = useState<
    { size: number; inStock: boolean }[]
  >([])
  const [selectedAddNew, setSelectedAddNew] = useState(false)
  const [promotion, setPromotion] = useState(false)
  const [selectedAddBestSelling, setSelectedAddBestSelling] = useState(false)
  const [selectedAddSalePrice, setSelectedAddSalePrice] = useState(0)
  const [selectedAddSaleEnds, setSelectedAddSaleEnds] = useState('')

  const loadCategories = async () => {
    try {
      const fetchedCategories = await fetchCategories()
      setCategories(fetchedCategories)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])
  useEffect(() => {
    if (promotion === false) {
      setSelectedAddSalePrice(0)
      setSelectedAddSaleEnds('')
    }
  }, [promotion])

  useEffect(() => {
    if (!openDialog) {
      setSelectedAddCategory(undefined)
      setSelectedAddFrName('')
      setSelectedAddEngName('')
      setSelectedAddArName('')
      setSelectedAddPrice(0)
      setSelectedAddFrDescription('')
      setSelectedAddEnDescription('')
      setSelectedAddArDescription('')
      setSelectedAddImages([])
      setSelectedAddSizes([])
      setSelectedAddNew(false)
      setSelectedAddBestSelling(false)
      setSelectedAddSalePrice(0)
      setSelectedAddSaleEnds('')
      setPromotion(false)
    }
  }, [openDialog])

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const { products: fetchedProducts, metadata: fetchedMetadata } =
        await fetchProducts()
      setProducts(fetchedProducts)
      setMetadata(fetchedMetadata)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setError('Failed to load data')
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleFetchProducts = async (params: FetchProductsParams) => {
    setLoading(true)
    try {
      const { products, metadata } = await fetchProducts(params)
      setProducts(products)
      setMetadata(metadata)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('Failed to load data')
      setLoading(false)
    }
  }

  return (
    <>
      <Layout>
        <LayoutHeader>
          <div className='ml-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <UserNav />
          </div>
        </LayoutHeader>
        <LayoutBody className='flex flex-col' fixedHeight>
          <div className='mb-2 flex items-center justify-between space-y-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Products</h2>
              <p className='text-muted-foreground'>
                {metadata?.totalDocs} Product(s) Found!
              </p>
            </div>
            <div className='flex items-center space-x-2'>
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger>
                  <Button>ADD NEW PRODUCT</Button>
                </DialogTrigger>
                <DialogContent className='max-h-screen overflow-y-scroll lg:max-w-screen-lg'>
                  <DialogHeader>
                    <DialogTitle>Add Product</DialogTitle>
                  </DialogHeader>
                  <div className='grid gap-4 py-4'>
                    <Label htmlFor='category'>Category</Label>
                    <div className='col-span-3'>
                      <Popover
                        open={openCombobox}
                        onOpenChange={setOpenCombobox}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant='outline'
                            role='combobox'
                            aria-expanded={openCombobox}
                            className='w-[200px] justify-between'
                          >
                            {selectedAddCategory?.engName}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-[200px] p-0'>
                          <Command>
                            <CommandGroup>
                              {categories.map((category) => (
                                <CommandItem
                                  key={category._id}
                                  onSelect={() => {
                                    setSelectedAddCategory(category)
                                    setOpenCombobox(false)
                                  }}
                                >
                                  {category.engName}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Label htmlFor='englishName'>English Name</Label>
                    <Input
                      id='englishName'
                      value={selectedAddEngName}
                      onChange={(event) =>
                        setSelectedAddEngName(event.target.value)
                      }
                      className='col-span-3'
                    />
                    <Label htmlFor='frenchName'>French Name</Label>
                    <Input
                      id='frenchName'
                      value={selectedAddFrName}
                      onChange={(event) =>
                        setSelectedAddFrName(event.target.value)
                      }
                      className='col-span-3'
                    />
                    <Label htmlFor='arabicName'>Arabic Name</Label>
                    <Input
                      id='arabicName'
                      value={selectedAddArName}
                      onChange={(event) =>
                        setSelectedAddArName(event.target.value)
                      }
                      className='col-span-3'
                    />
                    <Label htmlFor='price'>Price</Label>
                    <Input
                      id='price'
                      value={selectedAddPrice}
                      onChange={(event) =>
                        setSelectedAddPrice(Number(event.target.value))
                      }
                      className='col-span-3'
                    />
                    <Label htmlFor='englishDescription'>
                      English Description
                    </Label>
                    <Textarea
                      id='englishDescription'
                      value={selectedAddEnDescription}
                      onChange={(event) =>
                        setSelectedAddEnDescription(event.target.value)
                      }
                      className='col-span-3'
                    />
                    <Label htmlFor='frenchDescription'>
                      French Description
                    </Label>
                    <Textarea
                      id='frenchDescription'
                      value={selectedAddFrDescription}
                      onChange={(event) =>
                        setSelectedAddFrDescription(event.target.value)
                      }
                      className='col-span-3'
                    />
                    <Label htmlFor='arabicDescription'>
                      Arabic Description
                    </Label>
                    <Textarea
                      id='arabicDescription'
                      value={selectedAddArDescription}
                      onChange={(event) =>
                        setSelectedAddArDescription(event.target.value)
                      }
                      className='col-span-3'
                    />
                    <Label htmlFor='images'>
                      Images ({selectedAddImages.length} image(s) selected)
                    </Label>
                    <Input
                      id='images'
                      type='file'
                      multiple
                      accept='image/png, image/jpeg'
                      onChange={handleFileUpload}
                      className='col-span-3 dark:file:text-foreground'
                    />
                    <Label htmlFor='new'>New</Label>
                    <Switch
                      id='new'
                      checked={selectedAddNew}
                      onCheckedChange={setSelectedAddNew}
                      className='col-span-3'
                    />

                    <Label htmlFor='bestSelling'>Best Selling</Label>
                    <Switch
                      id='bestSelling'
                      checked={selectedAddBestSelling}
                      onCheckedChange={setSelectedAddBestSelling}
                      className='col-span-3'
                    />
                    <Label htmlFor='promotion'>Promotion</Label>
                    <Switch
                      id='promotion'
                      checked={promotion}
                      onCheckedChange={setPromotion}
                      className='col-span-3'
                    />
                    <Label htmlFor='salePrice'>Sale Price</Label>
                    <Input
                      disabled={!promotion}
                      id='salePrice'
                      value={selectedAddSalePrice}
                      onChange={(event) =>
                        setSelectedAddSalePrice(Number(event.target.value))
                      }
                      className='col-span-3'
                    />
                    <Label htmlFor='saleEnds'>
                      Sale Ends ({selectedAddSaleEnds.toLocaleLowerCase()})
                    </Label>
                    <Input
                      disabled={!promotion}
                      id='saleEnds'
                      type='date'
                      value={selectedAddSaleEnds}
                      onChange={(event) =>
                        setSelectedAddSaleEnds(event.target.value)
                      }
                      className='col-span-3'
                    />
                    <div className='col-span-3 flex justify-between'>
                      <Label htmlFor='sizes'>Sizes</Label>
                      <Button
                        onClick={() => {
                          setSelectedAddSizes([
                            ...selectedAddSizes,
                            { size: 0, inStock: false },
                          ])
                        }}
                      >
                        Add Size
                      </Button>
                    </div>
                    {selectedAddSizes.map((size, index) => (
                      <div
                        key={index}
                        className='col-span-3 grid grid-cols-5 items-center gap-4'
                      >
                        <Label htmlFor={`size-${index}`}>
                          Size {index + 1}
                        </Label>
                        <Input
                          id={`size-${index}`}
                          type='text'
                          value={size.size.toString()}
                          onChange={(e) => {
                            const newSizeValue = e.target.value
                            const updatedSizes = selectedAddSizes.map((s, i) =>
                              i === index ? { ...s, size: newSizeValue } : s
                            )
                            setSelectedAddSizes(updatedSizes)
                          }}
                        />
                        <Switch
                          checked={size.inStock}
                          id={`inStock-${index}`}
                          onCheckedChange={(checked) => {
                            const updatedSizes = selectedAddSizes.map((s, i) =>
                              i === index ? { ...s, inStock: checked } : s
                            )
                            setSelectedAddSizes(updatedSizes)
                          }}
                        />
                        <label
                          htmlFor={`inStock-${index}`}
                          className='text-center text-sm font-medium'
                        >
                          In Stock
                        </label>
                        <Button
                          className='h-8 w-8 rounded-sm border-2 border-solid border-red-500 bg-transparent text-red-500 hover:bg-transparent'
                          onClick={() => {
                            const updatedSizes = selectedAddSizes.filter(
                              (_, i) => i !== index
                            )
                            setSelectedAddSizes(updatedSizes)
                          }}
                        >
                          X
                        </Button>
                      </div>
                    ))}
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleSubmit}
                      disabled={
                        !selectedAddArName ||
                        !selectedAddEngName ||
                        !selectedAddFrName ||
                        !selectedAddArDescription ||
                        !selectedAddEnDescription ||
                        !selectedAddFrDescription ||
                        !selectedAddCategory ||
                        selectedAddImages.length === 0 ||
                        // selectedAddSizes.length === 0 ||
                        loading
                      }
                    >
                      Create The Product
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
            <DataTable
              data={products}
              metadata={metadata}
              columns={columns}
              loading={loading}
              error={error}
              fetchProducts={handleFetchProducts}
            />
          </div>
        </LayoutBody>
      </Layout>
    </>
  )
}
