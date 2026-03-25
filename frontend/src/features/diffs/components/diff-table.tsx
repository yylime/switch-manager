import { useRef, useState, useMemo, useEffect } from 'react'
import { parse } from 'diff2html'
import 'diff2html/bundles/css/diff2html.min.css'

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

import renderBlockLines from './parase-diff'
import { useConfigDiffs } from '../data/config-diffs'




export function DiffViewer() {


  const refs = useRef<HTMLDivElement[]>([])
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  // scroll
  const isClickScrolling = useRef(false)

  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [month, setMonth] = useState<Date | undefined>(new Date())

  // 🔗 点击左侧文件列表跳转
  const scrollToFile = (index: number) => {
    isClickScrolling.current = true

    setActiveIndex(index)

    const element = refs.current[index]
    const container = containerRef.current

    if (element && container) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start"
      })
    }

    // 更新 URL hash
    window.history.replaceState(null, "", `#file-${index}`)

    setTimeout(() => {
      isClickScrolling.current = false
    }, 500)
  }


  // 将本地日期转换为 YYYY-MM-DD 字符串，不进行时区转换
  const getDateString = (d?: Date) =>
    (d ?? new Date()).toLocaleDateString("sv-SE")

  // post get files
  const { data: data } = useConfigDiffs({ date: getDateString(date) })
  const diff_text = data?.content ?? ""


  const dateSet = useMemo(() => {
    return new Set(data?.date_list ?? [])
  }, [data?.date_list])

  const files = useMemo(() => {
    return parse(diff_text)
  }, [diff_text])
  // 🔗 滚动监听
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isClickScrolling.current) {
            const index = Number(entry.target.getAttribute("data-index"))
            setActiveIndex(index)

            // 同步 URL
            window.history.replaceState(null, "", `#file-${index}`)
          }
        })
      },
      {
        root: container,
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0
      }
    )

    refs.current.forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [files])

  useEffect(() => {
    const hash = window.location.hash

    if (hash.startsWith("#file-")) {
      const index = Number(hash.replace("#file-", ""))

      setTimeout(() => {
        scrollToFile(index)
      }, 200)
    }
  }, [files])

  return (
    <>
      <div className="flex flex-row justify-between pb-4">
        <Label htmlFor="date" className="text-md">
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
              captionLayout="dropdown"
              onMonthChange={setMonth}
              onSelect={(date) => {
                setDate(date)
                setMonth(date)
                setOpen(false)
              }}
              disabled={(date: Date) =>
                !dateSet.has(format(date, "yyyy-MM-dd"))
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
      {files.length > 0 ? <div className="flex gap-6">
        {/* 📁 文件列表 */}
        <aside className="w-64 pr-2 sticky top-4 self-start">
          <div className="bg-sidebar text-sidebar-foreground flex w-full flex-col rounded-lg border">
            <div className="flex items-center border-b p-3">
              <h2 className="font-semibold">文件列表</h2>
            </div>
            <div className="flex flex-1 flex-col overflow-hidden">
              <ul className="flex flex-1 flex-col gap-1 p-2">
                {files.map((f, i) => (
                  <li key={i}>
                    <button
                      onClick={() => scrollToFile(i)}
                      className={`flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-start text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 h-8 ${activeIndex === i
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }`}
                    >
                      <span className="truncate">{f.newName.replace(/^.*\//, '')}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* 🧩 Diff 主体 */}
        <div
          ref={containerRef}
          className="flex-1 space-y-8 overflow-y-auto max-h-[85vh] pr-2"
        >
          {files.map((file, fi) => (
            <div
              key={fi}
              data-index={fi}
              ref={(el) => {
                if (el) refs.current[fi] = el
              }}
              className="border rounded-lg p-4 shadow-sm"
            >
              <h3 className="font-semibold text-lg mb-3">
                {file.oldName} → {file.newName}
              </h3>
              {file.blocks.map((block, bi) => (
                <div key={bi} className="mb-4">
                  <div className="text-xs font-mono bg-gray-100 dark:bg-gray-300 dark:text-black px-2 py-1 rounded">
                    {block.header}
                  </div>

                  <pre className="font-mono text-sm mt-1 border-t dark:text-gray-50">
                    {renderBlockLines(block.lines)}
                  </pre>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div> : <div className="text-gray-500">{format(date ?? "", "yyyy-MM-dd")} 和昨日没有差异~</div>}


    </>

  )
}
