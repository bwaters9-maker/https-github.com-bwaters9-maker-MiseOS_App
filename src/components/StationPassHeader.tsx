/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PrepStation } from '../types';
import { ChefHat, AlertTriangle, CheckSquare } from 'lucide-react';

interface StationPassHeaderProps {
  currentStation: PrepStation | 'All';
  setCurrentStation: (station: PrepStation | 'All') => void;
  totalPrepCount: number;
  completedPrepCount: number;
  activeAlarmsCount: number;
  item86Count: number;
  brandName?: string;
  subTitle?: string;
  facilityCode?: string;
}

export default function StationPassHeader({
  currentStation,
  setCurrentStation,
  totalPrepCount,
  completedPrepCount,
  activeAlarmsCount: _activeAlarmsCount,
  item86Count,
  brandName = 'MiseOS',
  subTitle = 'Back-of-House Kitchen Coordination System',
  facilityCode = 'MAIN-PASS-NYC'
}: StationPassHeaderProps) {
  const stations: (PrepStation | 'All')[] = ['All', 'Sauté', 'Grill', 'Garde Manger', 'Pastry'];

  return (
    <header className="bg-brand-surface border-b border-brand-border sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand/Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-accent flex items-center justify-center shadow-lg border border-brand-accent">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-mono font-black tracking-tighter text-brand-text flex items-center gap-1.5 uppercase">
              {brandName} <span className="text-brand-accent font-bold text-xs bg-brand-bg px-1.5 py-0.5 border border-brand-accent rounded">{facilityCode}</span>
            </h1>
            <p className="text-[10px] text-brand-muted font-mono">
              {subTitle}
            </p>
          </div>
        </div>

        {/* Station Filter Switches */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-brand-bg/80 p-1 border border-brand-border rounded-lg">
          {stations.map((station) => (
            <button
              id={`station-filter-${station.toLowerCase().replace(/\s+/g, '-')}`}
              key={station}
              onClick={() => setCurrentStation(station)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                currentStation === station
                  ? 'bg-brand-accent text-white'
                  : 'text-brand-muted hover:text-brand-text hover:bg-brand-surface border border-transparent'
              }`}
            >
              {station}
            </button>
          ))}
        </div>

        {/* Header Stats Panel */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Prep Progress Indicator */}
          <div className="bg-brand-bg/50 border border-brand-border px-3 py-1.5 rounded-lg flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-brand-accent" />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-brand-muted uppercase leading-none">PREP YIELD</span>
              <span className="text-xs font-mono font-bold text-brand-accent leading-tight">
                {completedPrepCount}/{totalPrepCount}
              </span>
            </div>
          </div>

          {/* 86 Count Indicator */}
          <div className={`border px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
            item86Count > 0 
              ? 'bg-brand-accent/10 border-brand-accent text-brand-accent' 
              : 'bg-brand-bg/50 border-brand-border text-brand-muted'
          }`}>
            <AlertTriangle className={`w-4 h-4 ${item86Count > 0 ? 'text-brand-accent animate-pulse' : 'text-brand-muted'}`} />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-brand-muted uppercase leading-none">86'D INDEX</span>
              <span className="text-xs font-mono font-bold leading-tight">
                {item86Count} ITEMS
              </span>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
