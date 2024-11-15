"use client"

import { useState, useEffect } from 'react'
import { Button } from './button'
import { Input, type InputProps } from './input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from './command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'

export interface AutocompleteOption {
  value: string
  label: string
}

interface AutocompleteProps extends Omit<InputProps, 'value' | 'onChange'> {
  value?: string
  onChange?: (value: string) => void
  onAddNew?: (value: string) => Promise<void>
  options: AutocompleteOption[]
  onSearch?: (query: string) => Promise<void>
  placeholder?: string
  emptyMessage?: string
  addNewLabel?: string
  error?: boolean
}

export function Autocomplete({
  value,
  onChange,
  onAddNew,
  options,
  onSearch,
  placeholder = "Search...",
  emptyMessage = "No results found.",
  addNewLabel = "Add new item",
  error,
  ...props
}: AutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newItemValue, setNewItemValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const debouncedSearch = useDebounce(searchQuery, 300)

  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearch)
    }
  }, [debouncedSearch, onSearch])

  const handleAddNew = async () => {
    if (!onAddNew || !newItemValue.trim()) return

    setIsSubmitting(true)
    try {
      await onAddNew(newItemValue)
      setDialogOpen(false)
      setNewItemValue('')
      onChange?.(newItemValue)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              error && "border-destructive",
              props.className
            )}
          >
            {value || placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder={placeholder}
              onValueChange={setSearchQuery}
              className="border-none focus:ring-0"
            />
            <CommandEmpty className="py-2 px-4 text-sm">
              <div className="flex items-center justify-between">
                <span>{emptyMessage}</span>
                {onAddNew && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDialogOpen(true)
                      setOpen(false)
                      setNewItemValue(searchQuery)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {addNewLabel}
                  </Button>
                )}
              </div>
            </CommandEmpty>
            <CommandGroup className="max-h-[200px] overflow-auto">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange?.(option.value)
                    setOpen(false)
                  }}
                  className="flex items-center justify-between"
                >
                  {option.label}
                  {value === option.value && (
                    <Check className="h-4 w-4 opacity-100" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{addNewLabel}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newItemValue}
              onChange={(e) => setNewItemValue(e.target.value)}
              placeholder="Enter new value"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddNew}
              disabled={!newItemValue.trim() || isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}