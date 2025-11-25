
import React, { useState } from 'react';
import { Item, ItemType, Recipe } from '../types';
import { Hammer, Beaker, X } from 'lucide-react';

interface InventoryModalProps {
  inventory: { itemId: string; count: number }[];
  itemsDb: Record<string, Item>;
  recipesDb: Recipe[];
  onUseItem: (itemId: string) => void;
  onCraft: (recipeId: string) => void;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  inventory,
  itemsDb,
  recipesDb,
  onUseItem,
  onCraft,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'items' | 'crafting'>('items');

  const getCount = (id: string) => inventory.find(i => i.itemId === id)?.count || 0;

  return (
    <div className="absolute inset-0 bg-black/90 z-[70] flex items-center justify-center p-6">
      <div className="bg-slate-800 border-4 border-slate-500 rounded-xl p-4 max-w-2xl w-full shadow-2xl h-[500px] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-slate-600 pb-2">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            {activeTab === 'items' ? <Beaker /> : <Hammer />}
            {activeTab === 'items' ? 'Backpack' : 'Crafting Station'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold p-2 bg-slate-700 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button 
            onClick={() => setActiveTab('items')}
            className={`flex-1 p-2 rounded font-bold transition-colors ${activeTab === 'items' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            Items
          </button>
          <button 
            onClick={() => setActiveTab('crafting')}
            className={`flex-1 p-2 rounded font-bold transition-colors ${activeTab === 'crafting' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            Crafting
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
          {activeTab === 'items' ? (
            <div className="grid gap-2">
              {inventory.length === 0 && (
                <div className="text-center text-slate-500 italic mt-10">Your bag is empty.</div>
              )}
              {inventory.map(slot => {
                const item = itemsDb[slot.itemId];
                if (!item) return null;
                return (
                  <div key={item.id} className="bg-slate-700 p-3 rounded flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">{item.name} <span className="text-slate-400 text-sm">x{slot.count}</span></div>
                      <div className="text-xs text-slate-300">{item.description}</div>
                    </div>
                    {item.type === ItemType.CONSUMABLE && (
                      <button 
                        onClick={() => onUseItem(item.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-sm font-bold"
                      >
                        USE
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid gap-2">
               {recipesDb.map(recipe => {
                 const resultItem = itemsDb[recipe.resultId];
                 const canCraft = recipe.ingredients.every(ing => getCount(ing.itemId) >= ing.count);

                 return (
                   <div key={recipe.id} className={`p-3 rounded border-2 ${canCraft ? 'bg-slate-700 border-slate-600' : 'bg-slate-900 border-slate-800 opacity-60'}`}>
                     <div className="flex justify-between items-center mb-2">
                        <div className="font-bold text-white">{resultItem.name}</div>
                        <button 
                          onClick={() => canCraft && onCraft(recipe.id)}
                          disabled={!canCraft}
                          className={`px-3 py-1 rounded text-sm font-bold ${canCraft ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                        >
                          CRAFT
                        </button>
                     </div>
                     <div className="text-xs text-slate-300">Requires:</div>
                     <div className="flex gap-2 mt-1 flex-wrap">
                       {recipe.ingredients.map(ing => {
                         const ingItem = itemsDb[ing.itemId];
                         const hasEnough = getCount(ing.itemId) >= ing.count;
                         return (
                           <span key={ing.itemId} className={`px-2 py-0.5 rounded text-xs ${hasEnough ? 'bg-slate-600 text-white' : 'bg-red-900/50 text-red-200'}`}>
                             {ingItem.name} x{ing.count}
                           </span>
                         );
                       })}
                     </div>
                   </div>
                 );
               })}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};
