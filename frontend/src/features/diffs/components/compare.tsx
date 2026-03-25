import {useState, useMemo } from 'react'
import 'diff2html/bundles/css/diff2html.min.css'

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import { format } from "date-fns"
import { CheckIcon, ChevronDownIcon, GitCompare } from "lucide-react"

import {
    useSwitchList,
    useSwitchConfigDates,
    fetchSwitchConfigDiffs
} from '../data/config-diffs'
import { CaretSortIcon } from '@radix-ui/react-icons'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '@/lib/utils'

import { DiffViewer } from './parase-diff'
import { ApiError } from '@/client'
import { handleServerError } from '@/lib/handle-server-error'

export function ConfigCompare() {
    // Source 选择状态
    const [sourceSwitchId, setSourceSwitchId] = useState<string>("")
    const [sourceOpen, setSourceOpen] = useState(false)
    const [sourceDate, setSourceDate] = useState<Date | undefined>(undefined)
    const [sourceMonth, setSourceMonth] = useState<Date | undefined>(new Date())

    // Target 选择状态
    const [targetSwitchId, setTargetSwitchId] = useState<string>("")
    const [targetOpen, setTargetOpen] = useState(false)
    const [targetDate, setTargetDate] = useState<Date | undefined>(undefined)
    const [targetMonth, setTargetMonth] = useState<Date | undefined>(new Date())

    // 对比结果状态
    const [compareResult, setCompareResult] = useState<string>("")
    const [isComparing, setIsComparing] = useState(false)
    const [isDone, setIsDone] = useState(false)

    // 获取交换机列表
    const { data: switchList = [], isSuccess: isSwitchListSuccess } = useSwitchList()

    // 获取源交换机配置日期列表
    const { data: sourceDates = [] } = useSwitchConfigDates({ id: sourceSwitchId })

    // 获取目标交换机配置日期列表
    const { data: targetDates = [] } = useSwitchConfigDates({ id: targetSwitchId })

    // 将本地日期转换为 YYYY-MM-DD 字符串，不进行时区转换
    const getDateString = (d?: Date) =>
        d ? d.toLocaleDateString("sv-SE") : ""

    // 源交换机可用日期集合
    const sourceDateSet = useMemo(() => {
        return new Set(sourceDates?.map(d => format(new Date(d), "yyyy-MM-dd")) ?? [])
    }, [sourceDates])

    // 目标交换机可用日期集合
    const targetDateSet = useMemo(() => {
        return new Set(targetDates?.map(d => format(new Date(d), "yyyy-MM-dd")) ?? [])
    }, [targetDates])

    // 执行对比
    const handleCompare = async () => {
        if (!sourceSwitchId || !sourceDate || !targetSwitchId || !targetDate) {
            alert("请选择完整的交换机和日期信息")
            return
        }

        setIsComparing(true)
        try {
            const result = await fetchSwitchConfigDiffs({
                source_id: sourceSwitchId,
                source_date: getDateString(sourceDate),
                target_id: targetSwitchId,
                target_date: getDateString(targetDate)
            })
            setIsDone(true)
            setCompareResult(result)
        } catch (error: unknown) {
            handleServerError(error as ApiError)
        } finally {
            setIsComparing(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* 🎛️ 顶部选择区域 */}
            <div className="rounded-lg p-6 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* 源交换机选择 */}
                    <div className="flex flex-col md:flex-row items-center gap-4 border-r pr-4">
                        {/* <Label className='pb-2' htmlFor="source-switch">源</Label> */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant='outline'
                                    role='combobox'
                                    className={'w-70 justify-between font-normal'}
                                >
                                    {sourceSwitchId
                                        ? switchList.find((sw) => sw.id === sourceSwitchId)?.name
                                        : "选择源交换机..."}
                                    <CaretSortIcon className='ms-2 h-4 w-4 shrink-0 opacity-50' />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-70 p-0'>
                                <Command>
                                    <CommandInput placeholder='搜索交换机...' />
                                    <CommandList className="max-h-64 overflow-y-auto">
                                        <CommandEmpty>没有找到交换机。</CommandEmpty>

                                        <CommandGroup>
                                            {isSwitchListSuccess ? switchList?.map((f) => (
                                                <CommandItem
                                                    key={f.id}
                                                    value={f.name}
                                                    onSelect={() => {
                                                        setSourceSwitchId(f.id)
                                                        setSourceDate(undefined)
                                                        setSourceMonth(new Date())
                                                    }}
                                                >
                                                    <CheckIcon
                                                        className={cn(
                                                            "size-4",
                                                            sourceSwitchId === f.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {f.name}
                                                </CommandItem>
                                            )): []}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {/* 源交换机日期选择 */}
                        <Popover open={sourceOpen} onOpenChange={setSourceOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    id="date"
                                    className="w-36 justify-between font-normal"
                                >
                                    {sourceDate ? format(sourceDate, "yyyy-MM-dd") : "选择日期"}
                                    <ChevronDownIcon />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={sourceDate}
                                    month={sourceMonth}
                                    captionLayout="dropdown"
                                    onMonthChange={setSourceMonth}
                                    onSelect={(date) => {
                                        setSourceDate(date)
                                        setSourceMonth(date)
                                        setSourceOpen(false)
                                    }}
                                    disabled={(date: Date) =>
                                        !sourceDateSet.has(format(date, "yyyy-MM-dd"))
                                    }
                                    fixedWeeks
                                    className="p-0 [--cell-size:--spacing(9.5)]"
                                />

                                <div className="flex justify-end border-t p-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const today = new Date()
                                            setSourceDate(today)
                                            setSourceMonth(today)
                                            setSourceOpen(false)
                                        }}
                                    >
                                        {"今天"}
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4 border-r pr-4">
                        {/* <Label className='pb-2' htmlFor="source-switch">目的</Label> */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant='outline'
                                    role='combobox'
                                    className={'w-70 justify-between font-normal'}
                                >
                                    {targetSwitchId
                                        ? switchList.find((sw) => sw.id === targetSwitchId)?.name
                                        : "选择目的交换机..."}
                                    <CaretSortIcon className='ms-2 h-4 w-4 shrink-0 opacity-50' />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-70 p-0'>
                                <Command>
                                    <CommandInput placeholder='搜索交换机...' />
                                    <CommandList className="max-h-64 overflow-y-auto">
                                        <CommandEmpty>没有找到交换机。</CommandEmpty>

                                        <CommandGroup>
                                            {switchList?.map((f) => (
                                                <CommandItem
                                                    key={f.id}
                                                    value={f.name}
                                                    onSelect={() => {
                                                        setTargetSwitchId(f.id)
                                                        setTargetDate(undefined)
                                                        setTargetMonth(new Date())
                                                    }}
                                                >
                                                    <CheckIcon
                                                        className={cn(
                                                            "size-4",
                                                            targetSwitchId === f.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {f.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {/* 源交换机日期选择 */}
                        <Popover open={targetOpen} onOpenChange={setTargetOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    id="date"
                                    className="w-36 justify-between font-normal"
                                >
                                    {targetDate ? format(targetDate, "yyyy-MM-dd") : "选择日期"}
                                    <ChevronDownIcon />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={targetDate}
                                    month={targetMonth}
                                    captionLayout="dropdown"
                                    onMonthChange={setTargetMonth}
                                    onSelect={(date) => {
                                        setTargetDate(date)
                                        setTargetMonth(date)
                                        setTargetOpen(false)
                                    }}
                                    disabled={(date: Date) =>
                                        !targetDateSet.has(format(date, "yyyy-MM-dd"))
                                    }
                                    fixedWeeks
                                    className="p-0 [--cell-size:--spacing(9.5)]"
                                />

                                <div className="flex justify-end border-t p-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const today = new Date()
                                            setTargetDate(today)
                                            setTargetMonth(today)
                                            setTargetOpen(false)
                                        }}
                                    >
                                        {"今天"}
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-x-2 border-r">
                        <Button
                            onClick={handleCompare}
                            disabled={!sourceSwitchId || !sourceDate || !targetSwitchId || !targetDate || isComparing}
                            className="min-w-50"
                        >
                            {isComparing ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    对比中...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <GitCompare className="h-4 w-4" />
                                    开始对比
                                </span>
                            )}
                        </Button>
                    </div>



                </div>
                {/* 对比按钮 */}
            </div>
            {/* 🎛️ 对比展示区域 */}
            <div className="flex flex-col">
                {isDone && <DiffViewer diffText={compareResult} />}
            </div>

        </div>
    )
}
