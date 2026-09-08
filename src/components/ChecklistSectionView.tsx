import { FileUp, FileCheck2, CheckCircle2, AlertTriangle, XCircle, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ChecklistItem, ChecklistSection } from '@/types'

export const SECTION_TITLES: Record<ChecklistSection, string> = {
  inisiasi: '1. Inisiasi (Bobot 30%)',
  kualitatif: '2a. Proposal Investasi — Kualitatif (Bobot 35% dari total)',
  kuantitatif: '2b. Proposal Investasi — Kuantitatif (Bobot 35% dari total)',
  revolving: '3. Revolving — Internal Memo (Kategori Terpisah, Bobot 100%)',
}

export const SECTION_ORDER: ChecklistSection[] = ['inisiasi', 'kualitatif', 'kuantitatif', 'revolving']

function groupItems(items: ChecklistItem[]) {
  const bySection = new Map<ChecklistSection, Map<string, ChecklistItem[]>>()
  for (const section of SECTION_ORDER) bySection.set(section, new Map())
  for (const item of items) {
    const groups = bySection.get(item.section)
    if (!groups) continue
    if (!groups.has(item.group)) groups.set(item.group, [])
    groups.get(item.group)!.push(item)
  }
  return bySection
}

export function StatusIcon({ status }: { status: ChecklistItem['status'] }) {
  if (status === 'OK') return <CheckCircle2 className="h-4 w-4 text-emerald-600" />
  if (status === 'Revisi') return <AlertTriangle className="h-4 w-4 text-amber-500" />
  if (status === 'NO') return <XCircle className="h-4 w-4 text-red-500" />
  return <Circle className="h-4 w-4 text-muted-foreground/40" />
}

interface ChecklistSectionViewProps {
  items: ChecklistItem[]
  mode: 'upload' | 'readonly'
  onChooseFile?: (itemId: string, fileName: string) => void
  onReviseFile?: (itemId: string, fileName: string) => void
}

export function ChecklistSectionView(props: ChecklistSectionViewProps) {
  const { items } = props
  const grouped = groupItems(items)

  return (
    <div className="space-y-4">
      {SECTION_ORDER.map((section) => {
        const groups = grouped.get(section)
        if (!groups || groups.size === 0) return null
        return (
          <Card key={section}>
            <CardHeader>
              <CardTitle className="text-base">{SECTION_TITLES[section]}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {Array.from(groups.entries()).map(([groupName, groupItemsArr]) => (
                <div key={groupName} className="space-y-2">
                  <div className="text-sm font-semibold text-foreground/80">{groupName}</div>
                  <div className="divide-y divide-border/60 rounded-xl border border-border/60">
                    {groupItemsArr.map((item) => (
                      <ChecklistItemRow key={item.id} item={item} {...props} />
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function ChecklistItemRow({ item, mode, onChooseFile, onReviseFile }: { item: ChecklistItem } & ChecklistSectionViewProps) {
  const inputId = `file-${item.id}`

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (mode === 'upload') onChooseFile?.(item.id, file.name)
    else onReviseFile?.(item.id, file.name)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm">
        <StatusIcon status={item.status} />
        <span className="font-medium text-foreground">{item.label}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {mode === 'upload' ? (
          <>
            <label htmlFor={inputId}>
              <Button asChild size="sm" variant="outline">
                <span>
                  <FileUp className="h-3.5 w-3.5" />
                  Choose File
                </span>
              </Button>
            </label>
            <input id={inputId} type="file" className="hidden" onChange={handleFilePick} />
            <span className="max-w-[160px] truncate text-xs text-muted-foreground">{item.fileName ?? 'Belum ada file'}</span>
          </>
        ) : (
          <>
            <span className={cn('flex items-center gap-1.5 text-xs', item.fileName ? 'text-foreground' : 'text-muted-foreground')}>
              {item.fileName ? <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" /> : null}
              {item.fileName ?? 'Belum ada file'}
            </span>
            {mode === 'readonly' && onReviseFile && (
              <>
                <label htmlFor={inputId}>
                  <Button asChild size="sm" variant="outline">
                    <span>Revisi File</span>
                  </Button>
                </label>
                <input id={inputId} type="file" className="hidden" onChange={handleFilePick} />
              </>
            )}
            <StatusBadge status={item.status} />
          </>
        )}
      </div>
    </div>
  )
}

export function StatusBadge({ status }: { status: ChecklistItem['status'] }) {
  if (status === 'OK') return <Badge variant="success">OK</Badge>
  if (status === 'Revisi') return <Badge variant="warning">Revisi</Badge>
  if (status === 'NO') return <Badge variant="destructive">NO</Badge>
  return <Badge variant="secondary">Menunggu Review</Badge>
}
