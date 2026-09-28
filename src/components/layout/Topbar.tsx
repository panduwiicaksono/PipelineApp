import { useState } from 'react'
import { Bell, Search } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { ROLE_LABEL } from '@/types'
import { cn } from '@/lib/utils'

// Notifikasi dummy (06-update-round2 poin 9) — belum ada backend/notifikasi sungguhan.
const NOTIFICATIONS = [
  { id: 'n1', text: 'Pipeline Ternakita sudah lolos Fase 1, Anda bisa mulai review', time: '1 hari lalu', unread: true },
  { id: 'n2', text: 'Pipeline Cahaya Fatura di-release oleh Admin Investasi', time: '3 hari lalu', unread: true },
  { id: 'n3', text: 'Pipeline Kerjabantu gagal Fase 1 (nilai merah pada SLIK)', time: '1 hari lalu', unread: true },
  { id: 'n4', text: 'Dokumen SLIK untuk pipeline Dana Fatura Prima sudah dinilai', time: '7 hari lalu', unread: false },
  { id: 'n5', text: 'Review pipeline Nusantara Piutang oleh Legal selesai', time: '4 hari lalu', unread: false },
]

export function Topbar() {
  const currentUser = useAppStore((s) => s.currentUser)
  const [notifOpen, setNotifOpen] = useState(false)
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length

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
        <div className="relative">
          <button className="relative rounded-full p-2 hover:bg-secondary" onClick={() => setNotifOpen((v) => !v)}>
            <Bell className="h-5 w-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-border/60 bg-white p-2 shadow-lg">
                <div className="px-3 py-2 text-sm font-semibold text-foreground">Notifikasi</div>
                <div className="max-h-80 overflow-y-auto">
                  {NOTIFICATIONS.map((n) => (
                    <div key={n.id} className="flex items-start gap-2 rounded-xl px-3 py-2.5 hover:bg-secondary/60">
                      <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.unread ? 'bg-primary' : 'bg-transparent')} />
                      <div className="min-w-0">
                        <p className="text-sm leading-snug text-foreground">{n.text}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
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
