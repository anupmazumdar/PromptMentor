import React, { useState, useEffect } from 'react';
import { subscribeNetworkStatus, syncPendingActions } from '../services/offlineSync.service';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export const NetworkStatusBadge: React.FC = () => {
  const [online, setOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = subscribeNetworkStatus((isOnline, count) => {
      setOnline(isOnline);
      setPendingCount(count);
    });
    return unsubscribe;
  }, []);

  const handleManualSync = async () => {
    if (!online || isSyncing) return;
    setIsSyncing(true);
    try {
      await syncPendingActions();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Network Status Pill */}
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition-all ${
          online
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse'
        }`}
        title={online ? 'Online: Live AI connection active' : 'Offline: Changes saved locally in IndexedDB'}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            online ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-amber-400'
          }`}
        />
        <span className="hidden sm:inline">{online ? 'Online' : 'Offline (Cached)'}</span>
      </div>

      {/* Pending Sync Queue Pill */}
      {pendingCount > 0 && (
        <button
          onClick={handleManualSync}
          disabled={!online || isSyncing}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono border transition-all ${
            online
              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/25 cursor-pointer'
              : 'bg-slate-800 text-slate-400 border-slate-700 cursor-default'
          }`}
          title={online ? 'Click to sync pending changes now' : 'Changes will auto-sync once reconnected'}
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
          <span>{pendingCount} queued</span>
        </button>
      )}
    </div>
  );
};
