import { Bell, Search } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { ROLE_LABEL } from '@/types'

export function Topbar() {
  const currentUser = useAppStore((s) => s.currentUser)

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border/60 bg-white px-6">
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari..."
          className="h-10 w-full rounded-full border border-input bg-secondary/50 pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 hover:bg-secondary">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">3</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-semibold text-white">
              {currentUser ? ROLE_LABEL[currentUser.role].charAt(0) : '?'}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div className="hidden text-sm sm:block">
            <div className="font-semibold leading-none text-foreground">{currentUser?.username}</div>
            <div className="mt-1 text-xs text-muted-foreground">{currentUser ? ROLE_LABEL[currentUser.role] : ''}</div>
          </div>
        </div>
      </div>
    </header>
  )
}
