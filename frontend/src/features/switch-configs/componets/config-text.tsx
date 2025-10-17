"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import { SwitchesService } from "@/client"
import { useQuery } from "@tanstack/react-query"
import SyntaxHighlighter from 'react-syntax-highlighter'
import { github, atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { useTheme } from "@/context/theme-provider"

export function SwitchConfigText({ switchId }: { switchId: string }) {
    const [open, setOpen] = React.useState(false)
    const [date, setDate] = React.useState<Date | undefined>(new Date())
    const { resolvedTheme } = useTheme()

    const { data: config, isLoading, isError } = useQuery({
        queryKey: ['switch-config', switchId, date?.toISOString().split('T')[0]],
        queryFn: () => SwitchesService.getSwitchConfig({
            id: switchId,
            configDate: date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
        })
    })

    // 根据当前主题选择合适的高亮主题
    const syntaxHighlighterTheme = resolvedTheme === 'dark' ? atomOneDark : github

    return (
        <>
            <div className="flex flex-row w-full justify-between">
                <Label htmlFor="date" className="px-1 text-md">
                    查看置顶日期的配置
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            id="date"
                            className="w-48 justify-between font-normal"
                        >
                            {date ? date.toLocaleDateString() : "Select date"}
                            <ChevronDownIcon />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                                setDate(date)
                                setOpen(false)
                            }}
                            disabled={(date: Date) =>
                                date > new Date() || (config?.start_date ? date < new Date(config.start_date) : false)
                            }
                        />
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