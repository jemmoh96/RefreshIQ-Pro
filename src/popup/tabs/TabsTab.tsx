import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, RefreshCwOff, Layers, Globe, ChevronDown, Plus, Check } from 'lucide-react';
import { useTabsStore } from '../../store/tabsStore';
import { cn, truncate, truncateUrl } from '../../shared/utils';

const GROUP_COLORS = ['#22c55e','#3b82f6','#f59e0b','#ef4444','#a855f7','#ec4899'];

export default function TabsTab() {
  const { tabs, groups, selectedIds, loading, loadTabs, selectTab, deselectTab, selectAll, deselectAll, refreshTab, refreshSelected, refreshAll, addGroup, addTabToGroup } = useTabsStore();
  const [showGroups, setShowGroups]     = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [pickedColor, setPickedColor]   = useState(GROUP_COLORS[0]);

  useEffect(() => { loadTabs(); }, [loadTabs]);

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    addGroup(newGroupName.trim(), pickedColor);
    setNewGroupName('');
  };

  const allSelected = selectedIds.length === tabs.length && tabs.length > 0;

  return (
    <div className="space-y-3 animate-slide-up">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={allSelected ? deselectAll : selectAll} className="flex items-center gap-1.5 text-xs text-riq-muted hover:text-riq-text transition-colors">
            <div className={cn('w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors', allSelected ? 'bg-riq-green border-riq-green' : 'border-riq-border')}>
              {allSelected && <Check size={9} className="text-riq-bg" />}
            </div>
            {allSelected ? 'Deselect all' : 'Select all'}
          </button>
        </div>
        <div className="flex gap-1.5">
          <button onClick={refreshSelected} disabled={selectedIds.length === 0} className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs btn-ghost disabled:opacity-40">
            <RefreshCw size={11}/> Selected ({selectedIds.length})
          </button>
          <button onClick={refreshAll} className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs btn-primary">
            <RefreshCw size={11}/> All
          </button>
        </div>
      </div>

      {/* Tab list */}
      <div className="space-y-1 max-h-[240px] overflow-y-auto pr-0.5">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-riq-green/30 border-t-riq-green rounded-full animate-spin"/>
          </div>
        ) : tabs.length === 0 ? (
          <div className="text-center py-8 text-riq-muted text-xs">
            <Globe size={24} className="mx-auto mb-2 opacity-30"/>
            No open tabs found
          </div>
        ) : (
          tabs.map((tab) => {
            const isSelected = selectedIds.includes(tab.id);
            return (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded-lg border cursor-pointer transition-all duration-100',
                  isSelected
                    ? 'bg-riq-green/8 border-riq-green/30'
                    : 'bg-riq-elevated border-riq-border hover:border-riq-border-light',
                )}
                onClick={() => isSelected ? deselectTab(tab.id) : selectTab(tab.id)}
              >
                {/* Checkbox */}
                <div className={cn('w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center transition-colors', isSelected ? 'bg-riq-green border-riq-green' : 'border-riq-border')}>
                  {isSelected && <Check size={9} className="text-riq-bg"/>}
                </div>
                {/* Favicon */}
                <div className="w-4 h-4 shrink-0 rounded overflow-hidden bg-riq-border flex items-center justify-center">
                  {tab.favicon ? (
                    <img src={tab.favicon} className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display='none')} />
                  ) : <Globe size={10} className="text-riq-muted"/>}
                </div>
                {/* Title + URL */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-riq-text truncate">{truncate(tab.title, 35)}</p>
                  <p className="text-2xs text-riq-muted truncate">{truncateUrl(tab.url, 40)}</p>
                </div>
                {/* Status + action */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {tab.refreshActive && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-riq-green/10 border border-riq-green/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-riq-green animate-pulse"/>
                      <span className="text-2xs text-riq-green font-mono">{tab.refreshInterval}s</span>
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); refreshTab(tab.id); }}
                    className="w-6 h-6 flex items-center justify-center rounded text-riq-muted hover:text-riq-green hover:bg-riq-green/10 transition-colors"
                    title="Refresh this tab"
                  >
                    <RefreshCw size={11}/>
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Groups section */}
      <div className="glass-card overflow-hidden">
        <button onClick={() => setShowGroups(!showGroups)} className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium text-riq-muted hover:text-riq-text transition-colors">
          <span className="flex items-center gap-2"><Layers size={12}/> Tab Groups ({groups.length})</span>
          <ChevronDown size={12} className={cn('transition-transform', showGroups && 'rotate-180')}/>
        </button>
        <AnimatePresence>
          {showGroups && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-riq-border">
              <div className="p-3 space-y-3">
                {/* Existing groups */}
                {groups.length > 0 ? (
                  <div className="space-y-1.5">
                    {groups.map((g) => (
                      <div key={g.id} className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-riq-elevated border border-riq-border">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: g.color }}/>
                        <span className="text-xs text-riq-text flex-1">{g.name}</span>
                        <span className="text-2xs text-riq-muted">{g.tabIds.length} tabs</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-2xs text-riq-muted text-center py-1">No groups yet</p>
                )}
                {/* New group */}
                <div className="space-y-2">
                  <div className="flex gap-1.5">
                    {GROUP_COLORS.map((c) => (
                      <button key={c} onClick={() => setPickedColor(c)} className={cn('w-5 h-5 rounded-full transition-all', pickedColor === c ? 'ring-2 ring-white ring-offset-1 ring-offset-riq-surface scale-110' : '')} style={{ background: c }}/>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Group name…" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} onKeyDown={(e) => e.key==='Enter'&&handleCreateGroup()} className="glass-input flex-1 px-3 py-1.5 text-xs"/>
                    <button onClick={handleCreateGroup} disabled={!newGroupName.trim()} className="flex items-center gap-1 px-2.5 py-1.5 rounded btn-primary text-xs disabled:opacity-40">
                      <Plus size={11}/> Create
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        {[['Open Tabs', tabs.length], ['Selected', selectedIds.length], ['Groups', groups.length]].map(([l, v]) => (
          <div key={String(l)} className="glass-card px-2 py-2 text-center">
            <p className="font-mono text-sm font-bold text-riq-text">{v}</p>
            <p className="text-2xs text-riq-muted">{l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
