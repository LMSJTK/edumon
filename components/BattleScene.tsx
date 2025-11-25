
import React, { useState, useEffect } from 'react';
import { Creature, Move, Subject, QuizQuestion } from '../types';
import { Calculator, FlaskConical, BookOpen, Hourglass, Brush, Laptop, Zap, Shield, UserPlus, Repeat, Skull } from 'lucide-react';
import { generateBattleQuestion } from '../services/geminiService';
import { QuizModal } from './QuizModal';

interface BattleSceneProps {
  party: Creature[];
  enemyCreature: Creature;
  onBattleEnd: (updatedParty: Creature[], outcome: 'win' | 'lose' | 'run' | 'catch', caughtCreature?: Creature) => void;
}

const getIcon = (iconName: string, size: number = 24) => {
  const props = { size, className: "text-white drop-shadow-md" };
  switch (iconName) {
    case 'Calculator': return <Calculator {...props} />;
    case 'FlaskConical': return <FlaskConical {...props} />;
    case 'BookOpen': return <BookOpen {...props} />;
    case 'Hourglass': return <Hourglass {...props} />;
    case 'Brush': return <Brush {...props} />;
    case 'Laptop': return <Laptop {...props} />;
    default: return <Zap {...props} />;
  }
};

export const BattleScene: React.FC<BattleSceneProps> = ({ party, enemyCreature, onBattleEnd }) => {
  // Initialize battle state with a copy of the party to track HP changes locally
  const [battleParty, setBattleParty] = useState<Creature[]>(JSON.parse(JSON.stringify(party)));
  const [activeIndex, setActiveIndex] = useState(0);
  const [enemyHp, setEnemyHp] = useState(enemyCreature.maxHp);
  
  const [turn, setTurn] = useState<'player' | 'enemy'>('player');
  const [log, setLog] = useState<string>(`A wild ${enemyCreature.name} appeared!`);
  const [quiz, setQuiz] = useState<QuizQuestion | null>(null);
  const [pendingMove, setPendingMove] = useState<Move | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [mustSwitch, setMustSwitch] = useState(false); // true if current creature fainted

  const activeCreature = battleParty[activeIndex];

  // Helper to update a specific creature in the party
  const updateCreature = (index: number, updates: Partial<Creature>) => {
    setBattleParty(prev => {
      const newParty = [...prev];
      newParty[index] = { ...newParty[index], ...updates };
      return newParty;
    });
  };

  // Enemy Turn Logic
  useEffect(() => {
    if (turn === 'enemy' && enemyHp > 0) {
      const timer = setTimeout(() => {
        // Check if player active creature is alive (might have switched into a fainted one? shouldn't happen)
        if (activeCreature.currentHp <= 0) return;

        // Simple AI: Pick random move
        const move = enemyCreature.moves[Math.floor(Math.random() * enemyCreature.moves.length)];
        setLog(`${enemyCreature.name} used ${move.name}!`);
        
        // Damage Calc
        const damage = Math.floor(move.power * (enemyCreature.level / 5) * 0.5);
        
        setTimeout(() => {
          const newHp = Math.max(0, activeCreature.currentHp - damage);
          updateCreature(activeIndex, { currentHp: newHp });

          if (newHp <= 0) {
            setLog(`${activeCreature.name} fainted!`);
            
            // Check for loss condition
            const hasAlive = battleParty.some((c, i) => i !== activeIndex && c.currentHp > 0);
            if (!hasAlive) {
                setTimeout(() => onBattleEnd(battleParty, 'lose'), 2000);
            } else {
                setTimeout(() => {
                    setMustSwitch(true);
                    setShowSwitchMenu(true);
                    setLog(`Choose your next creature!`);
                }, 1500);
            }
          } else {
            setTurn('player');
            setLog(`What will ${activeCreature.name} do?`);
          }
        }, 1000);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [turn, enemyHp, enemyCreature, activeIndex, battleParty, onBattleEnd, activeCreature.currentHp, activeCreature.name]);

  const handleMoveSelect = async (move: Move) => {
    if (turn !== 'player') return;

    if (move.isSpecial) {
      setPendingMove(move);
      setIsThinking(true);
      setLog("Analyzing subject matter...");
      const q = await generateBattleQuestion(move.type, activeCreature.level);
      setQuiz(q);
      setIsThinking(false);
    } else {
      executePlayerMove(move, true);
    }
  };

  const handleQuizAnswer = (index: number) => {
    if (!quiz || !pendingMove) return;
    const isCorrect = index === quiz.correctIndex;
    setQuiz(null);
    
    if (isCorrect) {
      setLog("Correct! The move is super effective!");
      executePlayerMove(pendingMove, true);
    } else {
      setLog("Incorrect calculation... The move fizzled.");
      executePlayerMove(pendingMove, false);
    }
    setPendingMove(null);
  };

  const executePlayerMove = (move: Move, success: boolean) => {
    const damage = success 
      ? Math.floor(move.power * (activeCreature.level / 5) * 0.8) 
      : Math.floor(move.power * 0.2); 

    if (success) {
      setLog(`${activeCreature.name} used ${move.name}!`);
    }

    setTimeout(() => {
      setEnemyHp(prev => Math.max(0, prev - damage));
      if (enemyHp - damage <= 0) {
        // Distribute XP to active creature
        // Simple mechanic: Active creature gets 50 XP
        // In a real game we'd track participants.
        const xpGained = 50;
        
        // Apply XP and check level up locally before returning
        let newXp = activeCreature.xp + xpGained;
        let newLevel = activeCreature.level;
        let newHp = activeCreature.currentHp;
        let newMaxHp = activeCreature.maxHp;

        if (newXp >= activeCreature.toNextLevel) {
             newLevel += 1;
             newXp -= activeCreature.toNextLevel;
             newMaxHp += 5;
             newHp = newMaxHp; // Full heal on level up
             setLog(`${activeCreature.name} grew to level ${newLevel}!`);
        } else {
             setLog(`Wild ${enemyCreature.name} fainted! Gained ${xpGained} XP.`);
        }

        updateCreature(activeIndex, { 
            xp: newXp, 
            level: newLevel, 
            currentHp: newHp, 
            maxHp: newMaxHp 
        });

        // Slight delay to show message then exit
        setTimeout(() => onBattleEnd(battleParty, 'win'), 2000);
      } else {
        setTurn('enemy');
      }
    }, 1000);
  };

  const handleCatchAttempt = () => {
    if (turn !== 'player') return;
    setLog(`You invited ${enemyCreature.name} to study with you...`);
    
    setTimeout(() => {
        const catchChance = 1 - (enemyHp / enemyCreature.maxHp);
        const roll = Math.random(); 
        const success = roll < (catchChance + 0.1);
        
        if (success) {
            setLog(`Gotcha! ${enemyCreature.name} joined the party!`);
            const captured = { ...enemyCreature, currentHp: enemyHp };
            setTimeout(() => onBattleEnd(battleParty, 'catch', captured), 1500);
        } else {
            setLog(`${enemyCreature.name} refused the offer!`);
            setTimeout(() => setTurn('enemy'), 1000);
        }
    }, 1500);
  };

  const handleSwitch = (index: number) => {
    if (index === activeIndex) return;
    if (battleParty[index].currentHp <= 0) {
        setLog("That creature is too tired to battle!");
        return;
    }

    setShowSwitchMenu(false);
    setActiveIndex(index);
    setLog(`Go, ${battleParty[index].name}!`);

    // If switching was forced (fainted), it's now player's turn.
    // If switching was voluntary, it consumes the turn -> Enemy turn.
    if (mustSwitch) {
        setMustSwitch(false);
        setTurn('player');
    } else {
        setTurn('enemy');
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-800 z-50 flex flex-col">
      {/* Battle Arena */}
      <div className="flex-1 relative bg-gradient-to-b from-indigo-900 to-slate-800 overflow-hidden">
        
        {/* Enemy Status */}
        <div className="absolute top-8 left-8 bg-slate-100 rounded-lg p-3 border-4 border-slate-300 shadow-lg w-64">
          <div className="flex justify-between mb-1 text-black font-bold">
            <span>{enemyCreature.name}</span>
            <span>Lvl {enemyCreature.level}</span>
          </div>
          <div className="w-full bg-slate-300 h-3 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500 transition-all duration-500" 
              style={{ width: `${(enemyHp / enemyCreature.maxHp) * 100}%` }}
            />
          </div>
        </div>

        {/* Enemy Sprite */}
        <div className="absolute top-24 right-16 w-32 h-32 animate-bounce-slight">
           <div 
             className="w-full h-full rounded-full flex items-center justify-center shadow-2xl"
             style={{ backgroundColor: enemyCreature.spriteColor }}
           >
             {getIcon(enemyCreature.icon, 64)}
           </div>
        </div>

        {/* Player Sprite */}
        <div className="absolute bottom-32 left-16 w-40 h-40">
           <div 
             className="w-full h-full rounded-full flex items-center justify-center shadow-2xl border-4 border-white transition-colors duration-500"
             style={{ backgroundColor: activeCreature.spriteColor }}
           >
             {getIcon(activeCreature.icon, 80)}
           </div>
        </div>

        {/* Player Status */}
        <div className="absolute bottom-40 right-8 bg-slate-100 rounded-lg p-3 border-4 border-slate-300 shadow-lg w-64">
          <div className="flex justify-between mb-1 text-black font-bold">
            <span>{activeCreature.name}</span>
            <span>Lvl {activeCreature.level}</span>
          </div>
          <div className="w-full bg-slate-300 h-3 rounded-full overflow-hidden mb-1">
            <div 
              className="h-full bg-green-500 transition-all duration-500" 
              style={{ width: `${(activeCreature.currentHp / activeCreature.maxHp) * 100}%` }}
            />
          </div>
          <div className="text-right text-xs text-slate-600 font-bold">{activeCreature.currentHp}/{activeCreature.maxHp} HP</div>
        </div>
      </div>

      {/* UI Panel */}
      <div className="h-1/3 bg-slate-900 border-t-4 border-slate-600 p-4 flex gap-4">
        {/* Log Box */}
        <div className="flex-1 bg-slate-800 rounded border-2 border-slate-700 p-4 text-white font-mono text-lg leading-relaxed">
          {isThinking ? (
            <div className="flex items-center gap-2">
              <span className="animate-spin">⚙️</span> Generating Challenge...
            </div>
          ) : (
            log
          )}
        </div>

        {/* Action Menu */}
        {!quiz && turn === 'player' && !mustSwitch && (
          <div className="w-1/2 grid grid-cols-2 gap-2">
            {activeCreature.moves.map((move) => (
              <button
                key={move.id}
                onClick={() => handleMoveSelect(move)}
                className={`
                  p-2 rounded border-2 font-bold text-left flex flex-col justify-center relative hover:bg-slate-700 transition-colors
                  ${move.isSpecial ? 'bg-indigo-900 border-indigo-500' : 'bg-slate-800 border-slate-600'}
                `}
              >
                <span className="text-sm">{move.name}</span>
                <span className="text-[10px] uppercase tracking-wide opacity-70">{move.type}</span>
                {move.isSpecial && <span className="absolute top-1 right-1 text-yellow-400 text-xs">★</span>}
              </button>
            ))}
            <div className="grid grid-cols-2 gap-2">
                 <button onClick={handleCatchAttempt} className="bg-emerald-800 border-2 border-emerald-600 hover:bg-emerald-700 rounded font-bold text-emerald-100 flex items-center justify-center gap-2 text-sm">
                    <UserPlus size={16}/> RECRUIT
                 </button>
                 <button onClick={() => setShowSwitchMenu(true)} className="bg-amber-700 border-2 border-amber-600 hover:bg-amber-600 rounded font-bold text-amber-100 flex items-center justify-center gap-2 text-sm">
                    <Repeat size={16}/> SWITCH
                 </button>
            </div>
            <button onClick={() => onBattleEnd(battleParty, 'run')} className="bg-red-900 border-2 border-red-700 hover:bg-red-800 rounded font-bold text-red-100">RUN</button>
          </div>
        )}
      </div>

      {/* Switch Menu Overlay */}
      {showSwitchMenu && (
          <div className="absolute inset-0 bg-black/90 z-[60] flex items-center justify-center p-6">
            <div className="bg-slate-800 border-4 border-amber-500 rounded-xl p-4 max-w-lg w-full shadow-2xl">
                <div className="flex justify-between items-center mb-4 border-b border-slate-600 pb-2">
                     <h3 className="text-xl font-bold text-white">Switch Creature</h3>
                     {!mustSwitch && <button onClick={() => setShowSwitchMenu(false)} className="text-slate-400 hover:text-white font-bold text-xl">×</button>}
                </div>
                <div className="space-y-2">
                    {battleParty.map((creature, idx) => (
                        <button 
                            key={creature.id + idx}
                            onClick={() => handleSwitch(idx)}
                            disabled={creature.currentHp <= 0 || idx === activeIndex}
                            className={`w-full p-3 rounded flex items-center justify-between border-2 transition-all
                                ${idx === activeIndex ? 'bg-slate-700 border-indigo-500 cursor-default opacity-80' : ''}
                                ${creature.currentHp <= 0 ? 'bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed' : 'bg-slate-700 border-slate-500 hover:bg-slate-600 hover:border-white'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: creature.spriteColor}}>
                                    {getIcon(creature.icon, 16)}
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-white">{creature.name} {idx === activeIndex && <span className="text-indigo-400 text-xs">(Active)</span>}</div>
                                    <div className="text-xs text-slate-300">Lvl {creature.level} • {creature.type}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`font-bold ${creature.currentHp > 0 ? 'text-green-400' : 'text-red-500'}`}>
                                    {creature.currentHp > 0 ? `${creature.currentHp} HP` : 'FAINTED'}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
          </div>
      )}

      {/* Quiz Modal Overlay */}
      {quiz && (
        <QuizModal 
          question={quiz} 
          onAnswer={handleQuizAnswer} 
        />
      )}
    </div>
  );
};
