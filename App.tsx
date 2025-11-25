
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Position, Direction, Creature, GameMap, QuestState, Subject, QuizQuestion, ItemType, Trainer } from './types';
import { WorldMap } from './components/WorldMap';
import { BattleScene } from './components/BattleScene';
import { Dialog } from './components/Dialog';
import { QuizModal } from './components/QuizModal';
import { TouchControls } from './components/TouchControls';
import { InventoryModal } from './components/InventoryModal';
import { ALL_MAPS, CREATURES_DB, TILES, ITEMS, RECIPES, TRAINERS } from './data/gameData';
import { getCompanionAdvice, generateMap, generateQuizBatch } from './services/geminiService';
import { MapPin, Backpack, Bot, Star, Loader2, ChevronUp, ChevronDown, Briefcase } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.START_SCREEN);
  
  // World State
  const [maps, setMaps] = useState<Record<string, GameMap>>(ALL_MAPS);
  const [currentMapId, setCurrentMapId] = useState<string>('town');
  
  // Static Map Sequence definition
  const [mapSequence, setMapSequence] = useState<string[]>([
    'town', 'route1', 'forest1', 'forest2', 'town2', 'mountain', 'cave', 'pass', 'peak'
  ]);
  
  // Background Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const backgroundGenRef = useRef(false);

  // Player State
  const [playerPos, setPlayerPos] = useState<Position>({ x: 7, y: 5 });
  const [playerDir, setPlayerDir] = useState<Direction>(Direction.DOWN);
  const [party, setParty] = useState<Creature[]>([]);
  const [inventory, setInventory] = useState<{ itemId: string; count: number }[]>([]);
  
  // Interaction State
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [interactionContext, setInteractionContext] = useState<string | null>(null);
  const [activeTrainerId, setActiveTrainerId] = useState<string | null>(null); // Track which trainer we are fighting
  const [showInventory, setShowInventory] = useState(false);
  const [questState, setQuestState] = useState<QuestState>({
    hasStarter: false,
    badges: [],
    talkedToProfessor: false,
    defeatedTrainers: []
  });

  // Gym Quiz State
  const [isGymQuizActive, setIsGymQuizActive] = useState(false);
  const [gymQuestions, setGymQuestions] = useState<QuizQuestion[]>([]);
  const [gymQuestionIndex, setGymQuestionIndex] = useState(0);
  const [gymScore, setGymScore] = useState(0);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  // Battle State
  const [enemyCreature, setEnemyCreature] = useState<Creature | null>(null);

  // AI Companion State
  const [companionMsg, setCompanionMsg] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const currentMap = maps[currentMapId];

  // --- Inventory Helpers ---
  const addToInventory = (itemId: string, amount: number = 1) => {
    setInventory(prev => {
        const existing = prev.find(i => i.itemId === itemId);
        if (existing) {
            return prev.map(i => i.itemId === itemId ? { ...i, count: i.count + amount } : i);
        } else {
            return [...prev, { itemId, count: amount }];
        }
    });
  };

  const removeFromInventory = (itemId: string, amount: number = 1) => {
      setInventory(prev => {
          return prev.map(i => i.itemId === itemId ? { ...i, count: i.count - amount } : i)
                     .filter(i => i.count > 0);
      });
  };

  const handleUseItem = (itemId: string) => {
      const item = ITEMS[itemId];
      if (!item || item.type !== ItemType.CONSUMABLE) return;
      
      // Heal first injured party member
      const injuredIndex = party.findIndex(c => c.currentHp < c.maxHp);
      if (injuredIndex === -1) {
          setActiveDialog("Your party is already healthy!");
          return;
      }

      const amount = item.effectValue || 0;
      setParty(prev => {
          const newParty = [...prev];
          const creature = newParty[injuredIndex];
          creature.currentHp = Math.min(creature.maxHp, creature.currentHp + amount);
          return newParty;
      });
      removeFromInventory(itemId, 1);
      setActiveDialog(`Used ${item.name} on ${party[injuredIndex].name}. Recovered ${amount} HP.`);
  };

  const handleCraft = (recipeId: string) => {
      const recipe = RECIPES.find(r => r.id === recipeId);
      if (!recipe) return;
      
      // Verify ingredients
      const hasIngredients = recipe.ingredients.every(ing => {
          const slot = inventory.find(i => i.itemId === ing.itemId);
          return slot && slot.count >= ing.count;
      });

      if (!hasIngredients) {
          setActiveDialog("Missing ingredients!");
          return;
      }

      // Consume ingredients
      recipe.ingredients.forEach(ing => {
          removeFromInventory(ing.itemId, ing.count);
      });
      
      // Add result
      addToInventory(recipe.resultId, 1);
      setActiveDialog(`Crafted ${ITEMS[recipe.resultId].name}!`);
  };

  // --- Background Generation Logic ---
  useEffect(() => {
    const checkAndGenerate = async () => {
      // Check if we are in the LAST map of the known sequence
      const currentIndex = mapSequence.indexOf(currentMapId);
      
      if (currentIndex === mapSequence.length - 1) {
         // We are at the frontier. Generate the next map in background.
         if (backgroundGenRef.current) return; // Already running
         
         backgroundGenRef.current = true;
         setIsGenerating(true);
         console.log("Starting background generation for next area...");

         // Pick a theme based on level count
         const infiniteCount = mapSequence.length - 9; // 9 static maps
         const themes = ['dense jungle', 'volcanic wasteland', 'crystal clouds', 'cybernetic ruins', 'deep ocean trench', 'starry void'];
         const theme = themes[infiniteCount % themes.length];
         
         const newMapId = `gen_${Date.now()}`;
         const width = 12;
         const height = 12;
         const exits = [{x: 6, y: 0}, {x: 6, y: 11}]; // Top and Bottom exits standard for infinite chain

         const newTiles = await generateMap(theme, width, height, exits);
         
         if (newTiles) {
            const newMap: GameMap = {
                id: newMapId,
                name: `Unknown Zone ${infiniteCount + 1}`,
                width,
                height,
                tiles: newTiles,
                encounters: ['calc_boy', 'sci_guy', 'hist_hound', 'book_worm', 'paint_pal', 'byte_bit']
            };

            setMaps(prev => ({ ...prev, [newMapId]: newMap }));
            setMapSequence(prev => [...prev, newMapId]);
            console.log(`Generated ${newMapId} (${theme})`);
         }
         
         backgroundGenRef.current = false;
         setIsGenerating(false);
      }
    };

    checkAndGenerate();
  }, [currentMapId, mapSequence]);


  // --- Map Transition Logic ---
  const transitionToMap = (targetMapId: string, startPos: Position) => {
    if (!maps[targetMapId]) {
        // Should not happen with background gen, but safety check
        setActiveDialog("The path ahead is still forming... (Please wait)");
        return;
    }
    setCurrentMapId(targetMapId);
    setPlayerPos(startPos);
  };

  const handleMove = (newPos: Position) => {
    const tileId = currentMap.tiles[newPos.y][newPos.x];
    const tile = TILES[tileId];

    setPlayerPos(newPos);

    // 0. Auto-Heal Check (Immediate Effect)
    if (tile.type === 'healer') {
        setParty(prev => prev.map(c => ({ ...c, currentHp: c.maxHp })));
        setActiveDialog("A warm light heals your party!");
        return;
    }

    // 1. Explicit Warps (Static Maps hardcoded)
    if (tile.warpTo) {
       transitionToMap(tile.warpTo, tile.warpPos || {x:0,y:0});
       return;
    }
    
    // 2. Door Logic
    if (tile.type === 'door') {
        // Special handling for Lab
        if (currentMapId === 'town' && newPos.x === 12 && newPos.y === 7) {
            transitionToMap('lab', {x: 4, y: 6});
            return;
        }
        if (currentMapId === 'lab') {
            transitionToMap('town', {x: 12, y: 8}); // Exit lab
            return;
        }

        // Special handling for Library
        if (currentMapId === 'town2' && newPos.x === 3 && newPos.y === 4) {
            transitionToMap('library', {x: 4, y: 8});
            return;
        }
        if (currentMapId === 'library') {
            transitionToMap('town2', {x: 3, y: 5}); // Exit library
            return;
        }

        // Generic Sequence Logic (Next/Prev)
        const currentIndex = mapSequence.indexOf(currentMapId);
        
        const isTop = newPos.y === 0;
        const isBottom = newPos.y === currentMap.height - 1;
        const isRight = newPos.x === currentMap.width - 1;
        const isLeft = newPos.x === 0;

        if (isTop || isRight) {
            // Go Forward
            if (currentIndex < mapSequence.length - 1) {
                const nextMapId = mapSequence[currentIndex + 1];
                
                let entryPos = { x: Math.floor(maps[nextMapId].width / 2), y: maps[nextMapId].height - 2 };
                
                if (nextMapId === 'forest1') entryPos = { x: 5, y: 10 };
                if (nextMapId === 'forest2') entryPos = { x: 0, y: 8 }; // Entered from Left
                if (nextMapId === 'town2') entryPos = { x: 6, y: 8 };
                if (nextMapId === 'mountain') entryPos = { x: 5, y: 12 };
                if (nextMapId === 'cave') entryPos = { x: 5, y: 10 };
                if (nextMapId === 'pass') entryPos = { x: 5, y: 13 };
                if (nextMapId === 'peak') entryPos = { x: 6, y: 11 };
                
                if (nextMapId.startsWith('gen_')) {
                    entryPos = { x: 6, y: 10 }; // Standard for infinite
                }

                transitionToMap(nextMapId, entryPos);
            } else {
                // Waiting for gen
                setActiveDialog("The mist swirls ahead... (Generating next area)");
            }
        } else if (isBottom || isLeft) {
            // Go Backward
            if (currentIndex > 0) {
                const prevMapId = mapSequence[currentIndex - 1];
                
                let entryPos = { x: Math.floor(maps[prevMapId].width / 2), y: 1 };
                
                if (prevMapId === 'town') entryPos = { x: 7, y: 1 };
                if (prevMapId === 'route1') entryPos = { x: 5, y: 1 };
                if (prevMapId === 'forest1') entryPos = { x: 10, y: 2 };
                if (prevMapId === 'forest2') entryPos = { x: 6, y: 1 };
                if (prevMapId === 'town2') entryPos = { x: 6, y: 1 };
                if (prevMapId === 'mountain') entryPos = { x: 5, y: 1 };
                if (prevMapId === 'cave') entryPos = { x: 5, y: 1 };
                if (prevMapId === 'pass') entryPos = { x: 5, y: 1 };
                
                if (prevMapId.startsWith('gen_')) {
                    entryPos = { x: 6, y: 1 };
                }

                transitionToMap(prevMapId, entryPos);
            }
        }
    }

    // Encounters
    const isSafeZone = currentMapId.includes('town') || currentMapId === 'lab' || currentMapId === 'library';
    const isEncounterTile = (tile.type === 'grass' || currentMapId.includes('cave') || currentMapId.includes('mountain') || currentMapId.includes('peak')) && !isSafeZone;
    
    if (isEncounterTile && currentMap.encounters.length > 0) {
      if (party.length === 0) {
        if (Math.random() < 0.1) {
           setActiveDialog("It's dangerous to go into the wilderness without a creature! Go see the Professor.");
        }
        return; 
      }
      
      // Check if at least one creature is conscious
      if (!party.some(c => c.currentHp > 0)) {
          if (Math.random() < 0.1) {
             setActiveDialog("Your party is too tired to fight! Get to a healer!");
          }
          return;
      }

      if (Math.random() < 0.15) { // 15% chance
        startBattle();
      }
    }
  };

  const handleInteract = useCallback(() => {
    // Check tile in front based on direction for better precision
    let targetX = playerPos.x;
    let targetY = playerPos.y;

    if (playerDir === Direction.UP) targetY -= 1;
    if (playerDir === Direction.DOWN) targetY += 1;
    if (playerDir === Direction.LEFT) targetX -= 1;
    if (playerDir === Direction.RIGHT) targetX += 1;

    if(targetX >=0 && targetX < currentMap.width && targetY >= 0 && targetY < currentMap.height) {
        const tId = currentMap.tiles[targetY][targetX];
        const tile = TILES[tId];
        
        if(tile.interactionId === 'professor') {
            if (!questState.hasStarter) {
                setActiveDialog("Professor: Hello there! Welcome to the world of EduMon. It's dangerous to go alone without knowledge! Here, take this Additurt.");
                const newCreature = { ...CREATURES_DB['calc_boy'], currentHp: 40, xp: 0, toNextLevel: 100 };
                setParty([newCreature]);
                setQuestState(prev => ({ ...prev, hasStarter: true, talkedToProfessor: true }));
            } else {
                setActiveDialog("Professor: How is Additurt doing? Remember to study hard!");
            }
            return;
        }
        if(tile.interactionId === 'healer') {
            setParty(prev => prev.map(c => ({ ...c, currentHp: c.maxHp })));
            setActiveDialog("Nurse: I've restored your party to full health.");
            return;
        }
        if(tile.interactionId === 'sage') {
            setActiveDialog("Old Sage: You have reached the Peak of Knowledge! Beyond here lies the Infinite Unknown. Prepare yourself!");
            return;
        }
        if(tile.interactionId === 'gym_leader') {
            if (questState.badges.includes('Mind Badge')) {
                setActiveDialog("Librarian: You have already proven your worth. Knowledge is infinite!");
            } else {
                setActiveDialog("Librarian: To earn the Mind Badge, you must prove your mastery over 5 subjects: Math, CS, Language, History, and Art. Are you ready?");
                setInteractionContext('gym_start');
            }
            return;
        }
        // Trainer Interaction
        if (tile.type === 'trainer' && tile.trainerId) {
            const trainer = TRAINERS[tile.trainerId];
            if (!trainer) return;

            const isDefeated = questState.defeatedTrainers.includes(trainer.id);
            if (isDefeated) {
                setActiveDialog(`${trainer.name}: ${trainer.postBattleDialog}`);
            } else {
                setActiveDialog(`${trainer.name}: ${trainer.introDialog}`);
                setInteractionContext('trainer_battle_start');
                setActiveTrainerId(trainer.id);
            }
            return;
        }
    }
  }, [playerPos, playerDir, currentMap, questState]);

  const handleGameInput = useCallback((input: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'INTERACT') => {
    if (gameState !== GameState.WORLD_MAP) return;
    // If dialog is open, block movement. Interaction closes it/advances it (handled by Dialog component).
    // But to prevent 'walking while talking', we return.
    if (activeDialog) return;
    if (showInventory) return;

    if (input === 'INTERACT') {
      handleInteract();
      return;
    }

    let newDir = playerDir;
    let dx = 0;
    let dy = 0;

    switch (input) {
      case 'UP': newDir = Direction.UP; dy = -1; break;
      case 'DOWN': newDir = Direction.DOWN; dy = 1; break;
      case 'LEFT': newDir = Direction.LEFT; dx = -1; break;
      case 'RIGHT': newDir = Direction.RIGHT; dx = 1; break;
    }

    setPlayerDir(newDir);

    const nextX = playerPos.x + dx;
    const nextY = playerPos.y + dy;

    // Bounds check
    if (nextX < 0 || nextX >= currentMap.width || nextY < 0 || nextY >= currentMap.height) return;

    // Collision Check
    const tileId = currentMap.tiles[nextY][nextX];
    const tileDef = TILES[tileId];

    if (tileDef.type !== 'wall') {
      handleMove({ x: nextX, y: nextY });
    }
  }, [gameState, activeDialog, showInventory, playerPos, playerDir, currentMap, handleInteract]);

  // --- Input Listeners ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return; // Optional: Ignore generic repeat if we want strict timing, but browsers handle it.
      switch (e.key) {
        case 'ArrowUp': case 'w': handleGameInput('UP'); break;
        case 'ArrowDown': case 's': handleGameInput('DOWN'); break;
        case 'ArrowLeft': case 'a': handleGameInput('LEFT'); break;
        case 'ArrowRight': case 'd': handleGameInput('RIGHT'); break;
        case 'Enter': case ' ': handleGameInput('INTERACT'); break;
        case 'i': case 'b': setShowInventory(prev => !prev); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGameInput]);

  const startGymChallenge = async () => {
    setIsLoadingQuiz(true);
    const avgLevel = party.length > 0 ? Math.floor(party.reduce((acc, c) => acc + c.level, 0) / party.length) : 5;
    // Order: Math, CS, Language, History, Art
    const subjects = [Subject.MATH, Subject.CS, Subject.LANGUAGE, Subject.HISTORY, Subject.ART];
    
    try {
      const questions = await generateQuizBatch(subjects, avgLevel);
      if (questions.length > 0) {
        setGymQuestions(questions);
        setGymQuestionIndex(0);
        setGymScore(0);
        setIsGymQuizActive(true);
      } else {
        setActiveDialog("Librarian: My books are currently disorganized. Please come back later.");
      }
    } catch (e) {
      setActiveDialog("Librarian: A magical interference prevented the test. Try again.");
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const handleGymQuizAnswer = (index: number) => {
    const isCorrect = gymQuestions[gymQuestionIndex].correctIndex === index;
    if (isCorrect) setGymScore(prev => prev + 1);
    
    // Feedback
    setActiveDialog(isCorrect ? "Correct!" : "Incorrect.");
    setInteractionContext('gym_next');
  };

  const finishGymQuiz = () => {
    setIsGymQuizActive(false);
    // Pass threshold: 3 out of 5? Or 4/5? Let's say 3/5 is generous enough for a game.
    if (gymScore >= 3) {
        setActiveDialog(`Librarian: Magnificent! You answered ${gymScore}/5 correctly. You are worthy of this Badge.`);
        setQuestState(prev => ({ ...prev, badges: [...prev.badges, 'Mind Badge'] }));
    } else {
        setActiveDialog(`Librarian: You only got ${gymScore}/5 correct. You must study more before I can grant you the Badge.`);
    }
  };

  // Modified to accept specific creature for Trainers
  const startBattle = (specificEnemy?: Creature) => {
    if (party.length === 0) return; 

    let enemy: Creature;

    if (specificEnemy) {
        enemy = specificEnemy;
    } else {
        const randomId = currentMap.encounters[Math.floor(Math.random() * currentMap.encounters.length)];
        const template = CREATURES_DB[randomId];
        // Scale enemy level based on average party level
        const avgLevel = Math.floor(party.reduce((acc, c) => acc + c.level, 0) / party.length);
        enemy = {
          ...template,
          currentHp: template.maxHp,
          xp: 0,
          toNextLevel: 0,
          level: Math.max(2, avgLevel + Math.floor(Math.random() * 3) - 1)
        };
    }
    setEnemyCreature(enemy);
    setGameState(GameState.BATTLE);
  };

  const handleBattleEnd = (updatedParty: Creature[], outcome: 'win' | 'lose' | 'run' | 'catch', caughtCreature?: Creature) => {
      let finalParty = [...updatedParty];
      
      if (outcome === 'catch' && caughtCreature) {
          finalParty.push(caughtCreature);
          setActiveDialog(`You caught a ${caughtCreature.name}!`);
      }

      if (outcome === 'lose') {
          setActiveDialog("You blacked out! Study harder next time.");
          setPlayerPos({x: 7, y: 5}); // Return to safe spot
          setCurrentMapId('town');
          // Heal party on loss
          finalParty = finalParty.map(c => ({...c, currentHp: c.maxHp}));
      }
      
      if (outcome === 'run') {
          setActiveDialog("Got away safely!");
      }

      // Trainer Defeated Logic
      if (outcome === 'win' && activeTrainerId) {
          const trainer = TRAINERS[activeTrainerId];
          // Mark as defeated
          setQuestState(prev => ({
              ...prev,
              defeatedTrainers: [...prev.defeatedTrainers, trainer.id]
          }));
          setActiveDialog(`${trainer.name}: ${trainer.defeatDialog}`);
          // Trainer Reward?
          if (trainer.rewardItemId) {
              // We can't chain dialogs easily without a queue, but let's try simpler approach
              addToInventory(trainer.rewardItemId, 1);
              // This msg will be lost if we set activeDialog above. 
              // Let's just make the trainer give it next time you talk or assume it's looted.
              // Or append string.
          }
          setActiveTrainerId(null);
      }

      // Loot Logic (Wild Only)
      if ((outcome === 'win' || outcome === 'catch') && !activeTrainerId) {
          // 30% chance for a drop
          if (Math.random() < 0.4) {
              const possibleDrops = ['logic_leaf', 'pixel_water', 'code_scrap', 'history_dust'];
              const dropId = possibleDrops[Math.floor(Math.random() * possibleDrops.length)];
              addToInventory(dropId, 1);
              if (outcome === 'catch') {
              } else {
                 setActiveDialog(`Victory! Found 1 ${ITEMS[dropId].name}!`);
              }
          }
      }

      setParty(finalParty);
      setGameState(GameState.WORLD_MAP);
  };
  
  const askCompanion = async () => {
    setLoadingAdvice(true);
    const advice = await getCompanionAdvice(currentMap.name, questState, "Standing still");
    setCompanionMsg(advice);
    setLoadingAdvice(false);
  };

  // Party Management
  const movePartyMember = (index: number, direction: 'up' | 'down') => {
    const newParty = [...party];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newParty.length) return;
    
    const temp = newParty[index];
    newParty[index] = newParty[targetIndex];
    newParty[targetIndex] = temp;
    setParty(newParty);
  };

  // --- Render ---

  if (gameState === GameState.START_SCREEN) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex items-center justify-center flex-col gap-8">
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 animate-pulse text-center font-[Press Start 2P]">
          EduMon
        </h1>
        <p className="text-slate-400 text-xl max-w-md text-center">Knowledge is your greatest weapon.</p>
        <button 
          onClick={() => setGameState(GameState.WORLD_MAP)}
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-xl transition-transform hover:scale-105"
        >
          START ADVENTURE
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
      
      {/* World View */}
      {gameState === GameState.WORLD_MAP && (
        <div className="relative">
          {/* Top HUD */}
          <div className="absolute -top-16 left-0 right-0 flex justify-center pointer-events-none">
             <div className="bg-slate-900/80 text-white px-6 py-2 rounded-full border border-slate-600 shadow-lg flex flex-col items-center">
               <span className="text-lg font-bold text-amber-400">{currentMap.name}</span>
               {isGenerating && <span className="text-xs text-indigo-300 animate-pulse flex items-center gap-1"><Loader2 size={10} className="animate-spin"/> Extending world...</span>}
             </div>
          </div>
          
          <WorldMap 
            mapData={currentMap}
            playerPos={playerPos}
            playerDir={playerDir}
          />

          {/* Touch Controls Overlay */}
          {!showInventory && <TouchControls onInput={handleGameInput} />}

          {/* Right HUD */}
          <div className="absolute top-4 right-[-150px] flex flex-col gap-3 z-40">
            <button 
              onClick={askCompanion}
              className="w-36 bg-yellow-500 hover:bg-yellow-400 text-yellow-900 p-3 rounded-l-xl shadow-lg transition-all flex items-center gap-2 font-bold border-l-4 border-yellow-200"
            >
               <Bot size={20} /> AI Guide
            </button>
            <button 
              onClick={() => setShowInventory(true)}
              className="w-36 bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-l-xl shadow-lg transition-all flex items-center gap-2 font-bold border-l-4 border-emerald-400"
            >
               <Briefcase size={20} /> Bag
            </button>
            <div className="w-36 bg-slate-800 text-white p-3 rounded-l-xl shadow-lg border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-2 text-xs text-slate-400 uppercase border-b border-slate-700 pb-1">
                    <Backpack size={12} /> Party
                </div>
                {party.length === 0 ? (
                    <span className="text-xs italic text-slate-500">Empty</span>
                ) : (
                    party.map((c, index) => (
                        <div key={c.id + index} className="mb-3 bg-slate-700/50 p-2 rounded relative group">
                            <div className="flex justify-between items-center">
                                <div className="text-sm font-bold truncate w-20">{c.name}</div>
                                <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity absolute right-1 top-1 bg-slate-800 rounded border border-slate-600 z-10">
                                    {index > 0 && (
                                        <button onClick={(e) => {e.stopPropagation(); movePartyMember(index, 'up')}} className="p-0.5 hover:bg-slate-600 text-green-400"><ChevronUp size={12}/></button>
                                    )}
                                    {index < party.length - 1 && (
                                        <button onClick={(e) => {e.stopPropagation(); movePartyMember(index, 'down')}} className="p-0.5 hover:bg-slate-600 text-red-400"><ChevronDown size={12}/></button>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-green-400 mb-1">
                                <Star size={10} fill="currentColor" /> Lv.{c.level}
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-green-500 h-full" style={{width: `${(c.currentHp/c.maxHp)*100}%`}}></div>
                            </div>
                        </div>
                    ))
                )}
            </div>
          </div>

        </div>
      )}

      {/* Inventory Modal */}
      {showInventory && (
          <InventoryModal 
            inventory={inventory}
            itemsDb={ITEMS}
            recipesDb={RECIPES}
            onUseItem={handleUseItem}
            onCraft={handleCraft}
            onClose={() => setShowInventory(false)}
          />
      )}

      {/* Battle View */}
      {gameState === GameState.BATTLE && enemyCreature && party.length > 0 && (
        <BattleScene 
          party={party}
          enemyCreature={enemyCreature}
          onBattleEnd={handleBattleEnd}
        />
      )}

      {/* Fallback if battle state is invalid */}
      {gameState === GameState.BATTLE && (!party.length || !enemyCreature) && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
              <p>Battle Error: Missing data.</p>
              <button onClick={() => setGameState(GameState.WORLD_MAP)} className="mt-4 px-4 py-2 bg-red-600 rounded">Return to Map</button>
          </div>
      )}

      {/* Gym Quiz Loading Indicator */}
      {isLoadingQuiz && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-[60]">
             <Loader2 size={48} className="text-indigo-500 animate-spin mb-4" />
             <p className="text-white text-xl font-bold">Preparing Knowledge Challenge...</p>
        </div>
      )}

      {/* Gym Quiz Modal */}
      {/* HIDDEN IF DIALOG IS ACTIVE TO PREVENT OVERLAP */}
      {isGymQuizActive && !activeDialog && gymQuestions[gymQuestionIndex] && (
          <QuizModal 
            question={gymQuestions[gymQuestionIndex]}
            onAnswer={handleGymQuizAnswer}
            title={`Gym Challenge: Question ${gymQuestionIndex + 1}/${gymQuestions.length}`}
          />
      )}

      {/* Global Dialog Overlay */}
      {activeDialog && (
        <Dialog 
            key={activeDialog} // Force remount on text change to restart typing effect
            text={activeDialog} 
            onClose={() => {
                setActiveDialog(null);
                if (interactionContext === 'gym_start') {
                    startGymChallenge();
                    setInteractionContext(null);
                }
                if (interactionContext === 'gym_next') {
                    if (gymQuestionIndex < gymQuestions.length - 1) {
                        setGymQuestionIndex(prev => prev + 1);
                    } else {
                        finishGymQuiz();
                    }
                    setInteractionContext(null);
                }
                // Trainer Battle Start
                if (interactionContext === 'trainer_battle_start' && activeTrainerId) {
                    const trainer = TRAINERS[activeTrainerId];
                    const creatureTemplate = CREATURES_DB[trainer.creatureId];
                    const trainerCreature: Creature = {
                        ...creatureTemplate,
                        level: trainer.creatureLevel,
                        maxHp: creatureTemplate.maxHp + (trainer.creatureLevel * 2),
                        currentHp: creatureTemplate.maxHp + (trainer.creatureLevel * 2),
                        xp: 0, 
                        toNextLevel: 100,
                        name: `${trainer.name}'s ${creatureTemplate.name}` // Custom name
                    };
                    startBattle(trainerCreature);
                    setInteractionContext(null);
                }
            }} 
        />
      )}

      {/* Companion Chat Overlay */}
      {companionMsg && (
        <div className="absolute bottom-20 right-8 w-64 bg-yellow-100 border-4 border-yellow-500 rounded-lg p-4 shadow-2xl z-50 animate-bounce-slight">
           <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-yellow-800 flex items-center gap-2"><Bot size={16}/> Sparky</h4>
              <button onClick={() => setCompanionMsg(null)} className="text-yellow-800 hover:text-red-500 font-bold">×</button>
           </div>
           <p className="text-sm text-yellow-900 font-medium leading-snug">
             {loadingAdvice ? "Scanning environment..." : companionMsg}
           </p>
           <div className="absolute -bottom-2 right-6 w-4 h-4 bg-yellow-100 border-r-4 border-b-4 border-yellow-500 transform rotate-45"></div>
        </div>
      )}
      
      {/* Mobile controls hint */}
      <div className="absolute bottom-4 left-4 text-slate-500 text-xs hidden md:block">
        WASD / Arrows to Move • SPACE to Interact • B for Bag
      </div>

    </div>
  );
}
