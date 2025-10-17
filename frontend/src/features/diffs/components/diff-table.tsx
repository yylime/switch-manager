import { useRef, useState } from 'react'
import { parse } from 'diff2html'
import * as DMP from 'diff-match-patch'
import 'diff2html/bundles/css/diff2html.min.css'
import { diff_text } from '../data/data'

export const DiffViewer = () => {
  const files = parse(diff_text)
  const dmp = new (DMP as any).diff_match_patch()
  const refs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 🔗 点击左侧文件列表跳转
  const scrollToFile = (index: number) => {
    setActiveIndex(index)
    
    const element = refs.current[index]
    const container = containerRef.current
    
    if (element && container) {
      const containerRect = container.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()
      
      const offsetTop = elementRect.top - containerRect.top + container.scrollTop
      
      container.scrollTo({
        top: offsetTop - 20, // 减去20像素的偏移量，避免紧贴顶部
        behavior: 'smooth'
      })
    }
  }

  // 🔍 行内对比（用 diff-match-patch）
  const renderInlineDiff = (oldText: string, newText: string) => {
    const diffs = dmp.diff_main(oldText, newText)
    dmp.diff_cleanupSemantic(diffs)
    return diffs.map(([op, text]: [number, string], i: number) => {
      const color =
        op === 1
          ? 'bg-green-200/60 text-green-800'
          : op === -1
          ? 'bg-red-200/60 text-red-800 line-through'
          : ''
      return (
        <span key={i} className={`${color}`}>
          {text}
        </span>
      )
    })
  }

  return (
    <div className="flex gap-6">
      {/* 📁 文件列表 */}
      <aside className="w-64 pr-2">
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
                    className={`flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-start text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 h-8 ${
                      activeIndex === i
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
            ref={(el) => {
              refs.current[fi] = el
            }}
            className="border rounded-lg p-4 shadow-sm"
          >
            <h3 className="font-semibold text-lg mb-3 text-gray-700">
              {file.oldName} → {file.newName}
            </h3>
            {file.blocks.map((block, bi) => (
              <div key={bi} className="mb-4">
                <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                  {block.header}
                </div>

                <pre className="font-mono text-sm mt-1 border-t">
                  {block.lines.map((line, li) => {
                    const color =
                      line.type === 'insert'
                        ? 'bg-green-50 text-green-800'
                        : line.type === 'delete'
                        ? 'bg-red-50 text-red-800'
                        : 'text-gray-800'

                    const lineNum =
                      line.type === 'insert'
                        ? `+${line.newNumber ?? ''}`
                        : line.type === 'delete'
                        ? `-${line.oldNumber ?? ''}`
                        : `${line.oldNumber ?? ''}`

                    return (
                      <div
                        key={li}
                        className={`grid grid-cols-[4rem_1fr] ${color} px-2`}
                      >
                        <span className="text-right pr-2 text-gray-500 select-none">
                          {lineNum}
                        </span>
                        <span className="whitespace-pre-wrap">
                          {line.type === 'context'
                            ? line.content
                            : line.type === 'insert'
                            ? renderInlineDiff('', line.content)
                            : line.type === 'delete'
                            ? renderInlineDiff(line.content, '')
                            : line}
                        </span>
                      </div>
                    )
                  })}
                </pre>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
