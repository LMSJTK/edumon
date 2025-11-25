
import React from 'react';
import { GameMap, Position, Direction } from '../types';
import { TILES } from '../data/gameData';
import { User, Trees, Cross, Mountain, Snowflake, TreePine, Crown, GraduationCap } from 'lucide-react';

interface WorldMapProps {
  mapData: GameMap;
  playerPos: Position;
  playerDir: Direction;
}

const TILE_SIZE = 48;

export const WorldMap: React.FC<WorldMapProps> = ({ mapData, playerPos, playerDir }) => {
  
  const getTileContent = (tileId: number, x: number, y: number) => {
    const tile = TILES[tileId];
    
    const isCave = mapData.id.includes('cave');
    const isSummit = mapData.id.includes('peak');
    const isForest = mapData.id.includes('forest');
    const isMountain = mapData.id.includes('mountain') || mapData.id.includes('pass');

    switch (tile.type) {
      case 'wall':
        let bgClass = 'bg-slate-800 border-slate-700';
        let icon = <Trees size={20} className="text-emerald-800" />;
        
        if (isCave) {
           bgClass = 'bg-slate-900 border-slate-800';
           icon = <Mountain size={20} className="text-slate-600" />;
        } else if (isSummit) {
           bgClass = 'bg-slate-300 border-slate-400';
           icon = <Mountain size={20} className="text-slate-500" />;
        } else if (isForest) {
           bgClass = 'bg-emerald-900 border-emerald-950';
           icon = <TreePine size={24} className="text-emerald-700" />;
        } else if (isMountain) {
           bgClass = 'bg-stone-700 border-stone-800';
           icon = <Mountain size={20} className="text-stone-500" />;
        }

        return (
          <div className={`w-full h-full flex items-center justify-center ${bgClass}`}>
            {icon}
          </div>
        );
      case 'grass':
        if (isSummit) {
           return <div className="w-full h-full bg-slate-50 border border-slate-200 flex items-center justify-center opacity-90"><Snowflake size={12} className="text-slate-300 opacity-50" /></div>;
        }
        if (isForest) {
            return <div className="w-full h-full bg-emerald-800 border border-emerald-700 flex items-center justify-center opacity-90"><div className="w-1 h-1 bg-emerald-400 rounded-full opacity-30" /></div>;
        }
        if (isMountain || isCave) {
             return <div className="w-full h-full bg-stone-600 border border-stone-500 flex items-center justify-center opacity-90"><div className="w-1 h-1 bg-stone-400 rounded-full opacity-30" /></div>;
        }
        return <div className="w-full h-full bg-emerald-300 border border-emerald-400 flex items-center justify-center opacity-80"><div className="w-2 h-2 bg-emerald-600 rounded-full" /></div>;
      case 'door':
        return <div className="w-full h-full bg-amber-900 border border-amber-950 flex items-center justify-center text-[10px] text-amber-200 font-bold">EXIT</div>;
      case 'healer':
        return <div className="w-full h-full bg-pink-200 border border-pink-300 flex items-center justify-center"><Cross size={24} className="text-red-500" /></div>;
      case 'npc':
        if (tile.interactionId === 'gym_leader') {
             return <div className="w-full h-full bg-purple-200 flex items-center justify-center border border-purple-400"><Crown size={24} className="text-purple-600" /></div>;
        }
        return <div className="w-full h-full bg-slate-200 flex items-center justify-center"><User size={24} className="text-blue-600" /></div>;
      case 'trainer':
         return <div className="w-full h-full bg-orange-200 flex items-center justify-center border border-orange-400"><GraduationCap size={24} className="text-orange-700" /></div>;
      default:
        // Walkable
        if (isCave) {
           return <div className="w-full h-full bg-slate-700 border border-slate-600" />;
        } else if (isSummit) {
           return <div className="w-full h-full bg-white border border-slate-200" />;
        } else if (isForest) {
           return <div className="w-full h-full bg-emerald-900 border border-emerald-800" />;
        } else if (isMountain) {
           return <div className="w-full h-full bg-stone-300 border border-stone-400" />;
        }
        return <div className="w-full h-full bg-slate-100 border border-slate-200" />;
    }
  };

  return (
    <div 
      className="relative bg-black border-4 border-slate-700 rounded-lg shadow-2xl overflow-hidden"
      style={{ 
        width: mapData.width * TILE_SIZE, 
        height: mapData.height * TILE_SIZE 
      }}
    >
      {mapData.tiles.map((row, y) => (
        <div key={y} className="flex">
          {row.map((tileId, x) => (
            <div key={`${x}-${y}`} style={{ width: TILE_SIZE, height: TILE_SIZE }}>
              {getTileContent(tileId, x, y)}
            </div>
          ))}
        </div>
      ))}

      {/* Player */}
      <div 
        className="absolute transition-all duration-200 ease-linear z-10 flex items-center justify-center"
        style={{ 
          width: TILE_SIZE, 
          height: TILE_SIZE, 
          left: playerPos.x * TILE_SIZE, 
          top: playerPos.y * TILE_SIZE 
        }}
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full shadow-lg border-2 border-white flex items-center justify-center relative animate-bounce-slight">
            <User size={20} className="text-white" />
            {/* Companion */}
            <div className="absolute -top-4 -right-4 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center border border-yellow-600 animate-pulse shadow-sm z-20">
                <div className="text-[8px] font-bold text-yellow-900">AI</div>
            </div>
        </div>
      </div>
    </div>
  );
};
