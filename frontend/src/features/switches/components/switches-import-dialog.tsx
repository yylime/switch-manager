import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SwitchesService } from '@/client'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

const formSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, {
      message: 'Please upload a file',
    })
    .refine(
      (files) => [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        // 也可以加上旧版的 xls 以防万一
        // 'application/vnd.ms-excel' 
      ].includes(files?.[0]?.type),
      '请上传excel的xlsx文件'
    ),
})

type SwitchesImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SwitchesImportDialog({
  open,
  onOpenChange,
}: SwitchesImportDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { file: undefined },
  })

  const fileRef = form.register('file')
  const queryClient = useQueryClient()

  const onSubmit = async () => {
    const file = form.getValues('file')

    try {
      // 1. 开始 Loading 状态 (假设你有 UI 状态管理)
      // setIsSubmitting(true);

      // 2. 使用 await 等待后端响应
      const res = await SwitchesService.importSwitches({
        formData: { file: file[0] }
      });

      // 3. 上传成功后的反馈
      showSubmittedData(res, '导入结果');
      // refresh the table
      queryClient.invalidateQueries({ queryKey: ['switches'] })

      // 4. 只有成功了才关闭弹窗
      onOpenChange(false);
    } catch (error) {
      // 5. 错误捕获：防止上传失败时弹窗闪退或状态异常
      toast.error('导入失败，请检查文件格式或网络连接')
      // toast.error("导入失败，请检查文件格式或网络连接");
    } finally {
      // 6. 无论成功失败，重置 Loading 状态
      // setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val)
        form.reset()
      }}
    >
      <DialogContent className='gap-2 sm:max-w-sm'>
        <DialogHeader className='text-start'>
          <DialogTitle>导入设备</DialogTitle>
          <DialogDescription>
            导入设备，如果不知道格式请先点击导出
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='task-import-form' onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='file'
              render={() => (
                <FormItem className='my-2'>
                  <FormLabel>文件</FormLabel>
                  <FormControl>
                    <Input type='file' {...fileRef} className='h-8 py-0' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className='gap-2'>
          <DialogClose asChild>
            <Button variant='outline'>取消</Button>
          </DialogClose>
          <Button type='submit' form='task-import-form'>
            导入
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
