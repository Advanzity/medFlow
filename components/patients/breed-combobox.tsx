"use client"

import { Check, ChevronsUpDown, Plus, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useClinicStore } from "@/hooks/use-clinic"
import { searchBreeds, addNewEntry } from "@/app/actions/suggestions"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/use-debounce"
import { useEffect, useState } from "react"

interface BreedComboboxProps {
  species?: string
  value?: string
  onChange: (value: string) => void
  error?: boolean
}

export function BreedCombobox({ species, value, onChange, error }: BreedComboboxProps) {
  const [open, setOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [breeds, setBreeds] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [newBreed, setNewBreed] = useState("")

  const { selectedClinic } = useClinicStore()
  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => { 
    async function fetchBreeds() {
      if (!selectedClinic) return;
      const { success, data, error } = await searchBreeds({
        clinicId: selectedClinic.id,
        species: species || "",
        query: debouncedSearch,
      })
      if (success) {
        setBreeds(data || [])
      } else {
        toast.error(typeof error === 'string' ? error : 'An error occurred')
      }
    }
    fetchBreeds()
  }, [debouncedSearch, species, selectedClinic])

  if (!selectedClinic) {
    return (
      <div className="relative">
        <Input
          disabled
          placeholder="Please select a clinic first" 
          className={cn(
            "pr-10", // Add space for icon
            error && "border-destructive"
          )}
        />
        <ChevronsUpDown className="absolute right-3 top-3 h-4 w-4 opacity-50" />
      </div>
    )
  }
  

  // Early return if no species selected
  if (!species) {
    return (
      <div className="relative">
        <Input
          disabled
          placeholder="Select a species first"
          className={cn(
            "pr-10",
            error && "border-destructive" 
          )}
        />
        <ChevronsUpDown className="absolute right-3 top-3 h-4 w-4 opacity-50" />
      </div>
    )
  }
  
  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox" 
            aria-expanded={open}
            aria-label="Select breed"
            className={cn(
              "w-full justify-between font-normal",
              error && "border-destructive",
              !value && "text-muted-foreground"
            )}
          >
            {value || "Select breed"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          {/* <div className="flex flex-col gap-2 p-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search breeds..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div> */}
          <div className="flex flex-col gap-2 p-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search breeds..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex flex-col gap-2">
              {breeds.map((breed) => (
                <Button
                  key={breed}
                  variant="ghost"
                  className="justify-between"
                  onClick={() => {
                    onChange(breed)
                    setOpen(false)
                  }}
                >
                  {breed}
                  {breed === value && <Check className="h-4 w-4 shrink-0" />}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setDialogOpen(true)}
            >
              Add new breed
            </Button>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <div />
              </DialogTrigger>
              <DialogContent className="w-[400px]">
                <DialogHeader>
                  <DialogTitle>Add new breed</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2">
                  <Input
                    placeholder="Enter new breed..."
                    value={newBreed}
                    onChange={(e) => setNewBreed(e.target.value)}
                  />
                  <Button
                    variant="default"
                    onClick={async () => {
                      setIsLoading(true)
                      const { success, error } = await addNewEntry({
                        clinicId: selectedClinic.id,
                        type: "breed",
                        value: newBreed,
                        metadata: { species },
                      })
                      setIsLoading(false)
                      if (success) {
                        toast.success("Breed added successfully")
                        setBreeds([...breeds, newBreed])
                        setNewBreed("")
                        setDialogOpen(false)
                      } else {
                        toast.error(typeof error === "string" ? error : "Failed to add breed")
                      }
                    }}
                    disabled={!newBreed || isLoading}
                  >
                    Add breed
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            </div>
          </PopoverContent>
          </Popover>
    </div>
  )
}