import { useState, useMemo } from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import { format } from "date-fns"

import SyntaxHighlighter from 'react-syntax-highlighter'
import { github, atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { useTheme } from "@/context/theme-provider"
import { useSwitchConfig } from "../data/switch-config"

export function SwitchConfigText({ switchId }: { switchId: string }) {
    const [open, setOpen] = useState(false)
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [month, setMonth] = useState<Date | undefined>(new Date())

    const { resolvedTheme } = useTheme()

    // 将本地日期转换为 YYYY-MM-DD 字符串，不进行时区转换
    const getDateString = (d?: Date) =>
        (d ?? new Date()).toLocaleDateString("sv-SE")

    const { data: config, isLoading, isError } = useSwitchConfig({ id: switchId, config_date: getDateString(date) })

    const dateSet = useMemo(() => {
        return new Set(config?.date_list ?? [])
    }, [config?.date_list])

    // 根据当前主题选择合适的高亮主题
    const syntaxHighlighterTheme = resolvedTheme === 'dark' ? atomOneDark : github

    return (
        <>
            <div className="flex flex-row w-full justify-between">
                <Label htmlFor="date" className="px-1 text-md">
                    查看指定日期的配置
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            id="date"
                            className="w-48 justify-between font-normal"
                        >
                            {date ? format(date, "yyyy-MM-dd") : "Select date"}
                            <ChevronDownIcon />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            month={month}
                            onMonthChange={setMonth}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                                setDate(date)
                                setMonth(date)
                                setOpen(false)
                            }}
                            disabled={(date: Date) =>
                                !dateSet.has(format(date, "yyyy-MM-dd"))
                            }
                        />
                        <div className="flex justify-end border-t p-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const today = new Date()
                                    setDate(today)
                                    setMonth(today)
                                    setOpen(false)
                                }}
                            >
                                {"今天"}
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            <div className="mt-4 h-full w-full">
                {isLoading && <p>Loading configuration...</p>}
                {isError && <p>Error loading configuration</p>}
                {config && (
                    <div className="rounded-md">
                        <SyntaxHighlighter
                            language="json"
                            style={syntaxHighlighterTheme}
                            customStyle={{
                                padding: '1rem',
                                borderRadius: '0.375rem',
                                maxHeight: '70vh',
                                overflowX: 'auto'
                            }}
                        >
                            {config.content ?? "No configuration found"}
                        </SyntaxHighlighter>
                    </div>
                )}
            </div>
        </>
    )
}