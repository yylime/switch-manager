import type { ReactElement } from 'react'
import * as DMP from 'diff-match-patch'
import * as Diff2Html from "diff2html"
import { useMemo } from 'react'
import "diff2html/bundles/css/diff2html.min.css"

export default function renderBlockLines (lines: any[]): ReactElement[] {
  const result: ReactElement[] = []
  let i = 0
  const dmp = new (DMP as any).diff_match_patch()

  while (i < lines.length) {
    const line = lines[i]
    const nextLine = lines[i + 1]

    // 如果是 delete 行且下一行是 insert 行，则进行行内对比
    if (line.type === 'delete' && nextLine?.type === 'insert') {
      // 提取不带 +/- 前缀的实际内容
      const oldContent = line.content.replace(/^[-+]/, '').replace(/^\s*/, '')
      const newContent = nextLine.content.replace(/^[-+]/, '').replace(/^\s*/, '')

      // 计算差异
      const diffs = dmp.diff_main(oldContent, newContent)
      dmp.diff_cleanupSemantic(diffs)

      // 渲染删除行 - 只显示删除的部分（红色 + 删除线）
      result.push(
        <div
          key={`delete-${i}`}
          className="grid grid-cols-[4rem_1fr] bg-amber-100 px-2 dark:text-gray-800"
        >
          <span className="text-right pr-2 text-gray-600 select-none">
            {line.oldNumber ?? ''}
          </span>
          <span className="whitespace-pre-wrap">
            {diffs.map(([op, text]: [number, string], idx: number) => {
              if (op === -1) {
                // 删除的内容：显示并加删除线
                return <span key={idx} className="line-through bg-red-200">{text}</span>
              } else if (op === 0) {
                // 不变的内容：正常显示
                return <span key={idx}>{text}</span>
              }
              // op === 1 新增的内容在删除行中不显示
              return null
            })}
          </span>
        </div>
      )

      // 渲染插入行 - 只显示新增的部分（绿色背景）
      result.push(
        <div
          key={`insert-${i + 1}`}
          className="grid grid-cols-[4rem_1fr] bg-green-100 px-2 dark:text-gray-800"
        >
          <span className="text-right pr-2 text-gray-800 select-none">
            {nextLine.newNumber ?? ''}
          </span>
          <span className="whitespace-pre-wrap">
            {diffs.map(([op, text]: [number, string], idx: number) => {
              if (op === 1) {
                // 新增的内容：显示并用绿色背景高亮
                return <span key={idx} className="bg-green-400/60">{text}</span>
              } else if (op === 0) {
                // 不变的内容：正常显示
                return <span key={idx}>{text}</span>
              }
              // op === -1 删除的内容在插入行中不显示
              return null
            })}
          </span>
        </div>
      )

      i += 2 // 跳过已处理的 insert 行
    } else {
      // 单独的行（context、单独的 delete 或 insert）
      const color =
        line.type === 'insert'
          ? 'bg-green-100 dark:text-gray-800'
          : line.type === 'delete'
            ? 'bg-red-100 dark:text-gray-800'
            : ''

      const lineNum =
        line.type === 'insert'
          ? `+${line.newNumber ?? ''}`
          : line.type === 'delete'
            ? `-${line.oldNumber ?? ''}`
            : `${line.oldNumber ?? ''}`

      result.push(
        <div
          key={i}
          className={`grid grid-cols-[4rem_1fr] ${color} px-2`}
        >
          <span className="text-right pr-2 select-none">
            {lineNum}
          </span>
          <span className="whitespace-pre-wrap">
            {line.type === 'context'
              ? line.content
              : line.type === 'insert'
                ? line.content
                : line.type === 'delete'
                  ? line.content
                  : line}
          </span>
        </div>
      )

      i++
    }
  }

  return result
}


interface DiffViewerProps {
  diffText: string
}

export function DiffViewer({ diffText }: DiffViewerProps) {
  const html = useMemo(() => {
    if (!diffText) return ""

    return Diff2Html.html(diffText, {
      drawFileList: false,
      matching: "none",
      outputFormat: "side-by-side",
    })
  }, [diffText])

  // 如果没有 diff 内容
  if (!diffText || !diffText.includes("@@")) {
    return (
      <div className="text-center text-muted-foreground py-10">
        配置没有差异
      </div>
    )
  }

  return (
    <div
      className="diff-container"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}