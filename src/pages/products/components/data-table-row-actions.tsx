import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { Button } from '@/components/custom/button'
import { useToast } from '@/components/ui/use-toast'
import { ReloadIcon } from '@radix-ui/react-icons'
import { Switch } from '@/components/ui/switch'
import { Category } from '../data/schema'
import { Textarea } from '@/components/ui/textarea'
import { Command, CommandGroup, CommandItem } from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { productSchema } from '../data/schema'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  updateProduct: (updatedProduct: TData) => void
  deleteProduct: (deletedProduct: TData) => void
  categories: Category[]
}

export function DataTableRowActions<TData>({
  row,
  updateProduct,
  deleteProduct,
  categories,
}: DataTableRowActionsProps<TData>) {
  // Toast Hook :
  const { toast } = useToast()

  // Product State
  const product = productSchema.parse(row.original)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openCombobox, setOpenCombobox] = useState(false)

  // add product state
  const [selectedAddCategory, setSelectedAddCategory] = useState(
    product.category
  )
  const [selectedAddFrName, setSelectedAddFrName] = useState(product.frName)
  const [selectedAddEngName, setSelectedAddEngName] = useState(product.engName)
  const [selectedAddArName, setSelectedAddArName] = useState(product.arName)
  const [selectedAddPrice, setSelectedAddPrice] = useState(product.price)
  const [selectedAddFrDescription, setSelectedAddFrDescription] = useState(
    product.frDescription
  )
  const [selectedAddEnDescription, setSelectedAddEnDescription] = useState(
    product.engDescription
  )
  const [selectedAddArDescription, setSelectedAddArDescription] = useState(
    product.arDescription
  )
  const [selectedAddImages, setSelectedAddImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>(
    product.images || []
  )
  const [selectedAddSizes, setSelectedAddSizes] = useState(product.sizes || [])
  const [promotion, setPromotion] = useState(product.isSale)
  const [selectedAddNew, setSelectedAddNew] = useState(product.new)
  const [selectedAddBestSelling, setSelectedAddBestSelling] = useState(
    product.bestSelling
  )
  const [selectedAddSalePrice, setSelectedAddSalePrice] = useState(
    product.salePrice
  )
  const [selectedAddSaleEnds, setSelectedAddSaleEnds] = useState(
    product.saleEnds ? product.saleEnds.split('T')[0] : '' // Format date to YYYY-MM-DD
  )

  // Loading and Error States
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (promotion === false) {
      setSelectedAddSalePrice(0)
      setSelectedAddSaleEnds('')
    }
  }, [promotion])

  const handleDeleteProduct = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('jwt')

      const response = await axios.put(
        `https://api.arelaclothsy.com/products/${product._id}`,
        {
          isDrafted: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.status !== 200) {
        setIsLoading(false)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Error deleting product. Please try again.',
        })
      } else {
        deleteProduct(response.data)
        setIsLoading(false)
        setOpenDeleteDialog(false)
        toast({
          variant: 'default',
          className: 'bg-green-500',
          title: 'Success',
          description: 'Product Deleted Successfully',
        })
      }
    } catch (error) {
      console.error('Failed to delete category:', error)
      setIsLoading(false)
      setOpenDeleteDialog(false)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error deleting product. Please try again.',
      })
    }
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true)

      const token = localStorage.getItem('jwt')

      let uploadedImages = []

      if (selectedAddImages.length > 0) {
        const formData = new FormData()
        selectedAddImages.forEach((file) => {
          formData.append('images', file)
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

        uploadedImages = imageResponse.data._id
      }

      const productData = {
        frName: selectedAddFrName,
        engName: selectedAddEngName,
        arName: selectedAddArName,
        price: selectedAddPrice,
        frDescription: selectedAddFrDescription,
        engDescription: selectedAddEnDescription,
        arDescription: selectedAddArDescription,
        category: selectedAddCategory._id,
        images: uploadedImages.length > 0 ? uploadedImages : existingImages,
        sizes: selectedAddSizes,
        new: selectedAddNew,
        bestSelling: selectedAddBestSelling,
        salePrice: selectedAddSalePrice,
        saleEnds: selectedAddSaleEnds,
        isSale: promotion,
      }

      const response = await axios.put(
        `https://api.arelaclothsy.com/products/${product._id}`,
        productData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      updateProduct(response.data)
      setIsLoading(false)
      setOpenEditDialog(false)

      toast({
        title: 'Product updated successfully!',
        description: `Product ${response.data.engName} has been updated.`,
      })
    } catch (error) {
      console.error('Error updating product:', error)
      setIsLoading(false)

      toast({
        title: 'Error updating product',
        description: 'There was a problem updating the product.',
        variant: 'destructive',
      })
    }
  }

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    setSelectedAddImages(files)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem onClick={() => setOpenEditDialog(true)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDeleteDialog(true)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className='max-h-screen overflow-y-scroll lg:max-w-screen-lg'>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <Label htmlFor='category'>Category</Label>
            <div className='col-span-3'>
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
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
              onChange={(event) => setSelectedAddEngName(event.target.value)}
              className='col-span-3'
            />
            <Label htmlFor='frenchName'>French Name</Label>
            <Input
              id='frenchName'
              value={selectedAddFrName}
              onChange={(event) => setSelectedAddFrName(event.target.value)}
              className='col-span-3'
            />
            <Label htmlFor='arabicName'>Arabic Name</Label>
            <Input
              id='arabicName'
              value={selectedAddArName}
              onChange={(event) => setSelectedAddArName(event.target.value)}
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
            <Label htmlFor='englishDescription'>English Description</Label>
            <Textarea
              id='englishDescription'
              value={selectedAddEnDescription}
              onChange={(event) =>
                setSelectedAddEnDescription(event.target.value)
              }
              className='col-span-3'
            />
            <Label htmlFor='frenchDescription'>French Description</Label>
            <Textarea
              id='frenchDescription'
              value={selectedAddFrDescription}
              onChange={(event) =>
                setSelectedAddFrDescription(event.target.value)
              }
              className='col-span-3'
            />
            <Label htmlFor='arabicDescription'>Arabic Description</Label>
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
            <Label htmlFor='saleEnds'>Sale Ends</Label>
            <Input
              disabled={!promotion}
              id='saleEnds'
              type='date'
              value={selectedAddSaleEnds}
              onChange={(event) => setSelectedAddSaleEnds(event.target.value)}
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
                <Label htmlFor={`size-${index}`}>Size {index + 1}</Label>
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
                isLoading
              }
            >
              {isLoading ? (
                <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                'Update The Product'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <div className='py-4'>
            Are you sure you want to delete the product named '{product.engName}
            ' ?
          </div>
          <DialogFooter>
            <Button variant='ghost' onClick={() => setOpenDeleteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeleteProduct} disabled={isLoading}>
              {isLoading ? (
                <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
