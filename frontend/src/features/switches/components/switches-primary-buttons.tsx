import { Plus, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSwitchesContext } from './switches-provider'
import { SwitchesService } from '@/client';
import { downloadFile } from '@/lib/download';

export function SwitchesPrimaryButtons() {

  const handleBulkExport = async () => {
    const res = await SwitchesService.exportSwitches();
    downloadFile(res, "设备清单.xlsx");
  }

  const { setOpen } = useSwitchesContext()
  return (
    <div className='flex gap-2'>
      <Button
        variant="secondary"
        className='space-x-1'
        onClick={handleBulkExport}
      >
        <span>导出</span> <Upload size={18} />
      </Button>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('import')}
      >
        <span>导入</span> <Download size={18} />
      </Button>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>新增</span> <Plus size={18} />
      </Button>
    </div>
  )
}
