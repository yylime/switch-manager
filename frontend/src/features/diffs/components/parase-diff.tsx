export interface DiffLine {
  type: 'added' | 'removed' | 'context';
  content: string;
}

export interface FileDiff {
  filename: string;
  lines: DiffLine[];
}

/**
 * 将 unified diff 文本解析成数组
 */
export function parseDiff(diffText: string): FileDiff[] {
  const files: FileDiff[] = [];
  const lines = diffText.split('\n');
  let currentFile: FileDiff | null = null;

  for (const line of lines) {
    if (line.startsWith('--- ')) {
      currentFile = { filename: line.slice(4).trim(), lines: [] };
      files.push(currentFile);
    } else if (line.startsWith('+++ ')) {
      // 可以用作新文件名（可选）
      continue;
    } else if (line.startsWith('+')) {
      currentFile?.lines.push({ type: 'added', content: line });
    } else if (line.startsWith('-')) {
      currentFile?.lines.push({ type: 'removed', content: line });
    } else {
      currentFile?.lines.push({ type: 'context', content: line });
    }
  }

  return files;
}
