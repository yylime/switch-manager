import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
// import { SelectDropdown } from '@/components/select-dropdown'
import { type Branch } from '../data/schema'
import type { ApiError } from "@/client/core/ApiError"
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { BranchesService } from '@/client'
import { toast } from 'sonner'


type BranchMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Branch
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
})
type BranchForm = z.infer<typeof formSchema>

export function BranchMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: BranchMutateDrawerProps) {
  const isUpdate = !!currentRow

  const form = useForm<BranchForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow ?? {
      name: '',
    },
  })

  const queryClient = useQueryClient()
  const createMutation = useMutation({
    mutationFn: (data: BranchForm) => BranchesService.createBranch({ requestBody: data }),
    onSuccess: () => {
      // 让列表重新拉取
      queryClient.invalidateQueries({ queryKey: ['branches'] })
      // 关闭 drawer 并清理当前行
      onOpenChange(false)
      showSubmittedData(form.getValues(), 'The following branch has been created:')
      form.reset()
    },
    onError: (err: ApiError) => {
      const errorMessage =
        (typeof err === 'object' &&
          err !== null &&
          'body' in err &&
          (err as any).body?.detail?.message) ||
        (typeof err === 'object' &&
          err !== null &&
          'body' in err &&
          (err as any).body?.detail) ||
        err.message ||
        'An error occurred'
      toast.error(errorMessage)
    },
  })
  const updateMutation = useMutation({
    mutationFn: (data: BranchForm) => BranchesService.updateBranch({ id: currentRow!.id, requestBody: data }),
    onSuccess: () => {
      // 让列表重新拉取
      queryClient.invalidateQueries({ queryKey: ['branches'] })
      // 关闭 drawer 并清理当前行
      onOpenChange(false)
      showSubmittedData(form.getValues(), 'The following branch has been updated:')
      form.reset()
    },
    onError: (err: ApiError) => {
      const errorMessage =
        (typeof err === 'object' &&
          err !== null &&
          'body' in err &&
          (err as any).body?.detail?.message) ||
        (typeof err === 'object' &&
          err !== null &&
          'body' in err &&
          (err as any).body?.detail) ||
        err.message ||
        'An error occurred'
      toast.error(errorMessage)
    },
  })
  const onSubmit = (data: BranchForm) => {
    // do something with the form data
    if (isUpdate && currentRow) {
      // update logic here
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
    
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Task</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the task by providing necessary info.'
              : 'Add a new task by providing necessary info.'}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='tasks-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter a name' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>Close</Button>
          </SheetClose>
          <Button form='tasks-form' type='submit'>
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
