import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { Button } from '@/components/custom/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { wilayaSchema } from '../data/schema'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  updateWilaya: (updatedWilaya: TData) => void
}

export function DataTableRowActions<TData>({
  row,
  updateWilaya,
}: DataTableRowActionsProps<TData>) {
  const wilaya = wilayaSchema.parse(row.original)
  const [arName, setArName] = useState(wilaya.arName)
  const [frName, setFrName] = useState(wilaya.frName)
  const [engName, setEngName] = useState(wilaya.engName)
  const [openDialog, setOpenDialog] = useState(false)

  useEffect(() => {
    if (!openDialog) {
      setArName(wilaya.arName)
      setEngName(wilaya.engName)
      setFrName(wilaya.frName)
    }
  }, [openDialog, wilaya])

  const handleSubmit = async () => {
    try {
      if (
        arName === wilaya.arName &&
        frName === wilaya.frName &&
        engName === wilaya.engName
      ) {
        setOpenDialog(false)
        return
      }
      const token = localStorage.getItem('jwt')

      const response = await axios.put(
        `https://api.arelaclothsy.com/heroes/${wilaya._id}`,
        {
          arName,
          frName,
          engName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('Update successful:', response.data)
      updateWilaya(response.data)
      setOpenDialog(false)
      // Optionally, handle any post-update logic here, such as redirecting or displaying a success message
    } catch (error) {
      console.error('Failed to update wilaya:', error)
      // Optionally, handle errors, such as displaying error messages to the user
    }
  }

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
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
          <DialogTrigger asChild>
            <DropdownMenuItem onClick={(event) => event.stopPropagation()}>
              Edit
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Edit Hero for "{wilaya.engName}"</DialogTitle>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='arName' className='text-right'>
              Arabic Name
            </Label>
            <Input
              id='arName'
              value={arName}
              onChange={(event) => setArName(event.target.value)}
              className='col-span-3'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='frName' className='text-right'>
              French Name
            </Label>
            <Input
              id='frName'
              value={frName}
              onChange={(event) => setFrName(event.target.value)}
              className='col-span-3'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='engName' className='text-right'>
              English Name
            </Label>
            <Input
              id='engName'
              value={engName}
              onChange={(event) => setEngName(event.target.value)}
              className='col-span-3'
            />
          </div>
        </div>
        <DialogFooter>
          <Button type='submit' onClick={handleSubmit}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
