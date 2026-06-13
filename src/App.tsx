/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import {
  PrepItem,
  KitchenTimer,
  Recipe,
  HandoverLog,
  Item86,
  PrepStation,
  Ingredient,
  SubRecipe
} from './types';
import {
  INITIAL_PREP_ITEMS,
  INITIAL_TIMERS,
  INITIAL_RECIPES,
  INITIAL_HANDOVERS,
  INITIAL_86_ITEMS,
  INITIAL_SUB_RECIPES
} from './data';
import {
  formatMs,
  calculateRawQuantity,
  calculateIngredientCost,
  calculateRecipeCostDetails
} from './utils';
import StationPassHeader from './components/StationPassHeader';
import ErrorBoundary from './components/ErrorBoundary';
import {
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Play,
  Pause,
  Printer,
  ChevronRight,
  PlusCircle,
  HelpCircle,
  Check,
  Percent,
  TrendingDown,
  FileText,
  Volume2,
  VolumeX,
  X,
  Settings
} from 'lucide-react';
import RecipeSpecSheetBuilder from './RecipeSpecSheet';

export default function App() {
  // --- STATE ---
  const [currentStation, setCurrentStation] = useState<PrepStation | 'All'>('All');
  const [prepItems, setPrepItems] = useState<PrepItem[]>(() => {
    const saved = localStorage.getItem('miseos_prep_items');
    return saved ? JSON.parse(saved) : INITIAL_PREP_ITEMS;
  });
  const [timers, setTimers] = useState<KitchenTimer[]>(() => {
    const saved = localStorage.getItem('miseos_timers');
    return saved ? JSON.parse(saved) : INITIAL_TIMERS;
  });
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('miseos_recipes');
    return saved ? JSON.parse(saved) : INITIAL_RECIPES;
  });
  const [handovers, setHandovers] = useState<HandoverLog[]>(() => {
    const saved = localStorage.getItem('miseos_handovers');
    return saved ? JSON.parse(saved) : INITIAL_HANDOVERS;
  });
  const [items86, setItems86] = useState<Item86[]>(() => {
    const saved = localStorage.getItem('miseos_86_items');
    return saved ? JSON.parse(saved) : INITIAL_86_ITEMS;
  });

  // Navigation Panel Tabs
  const [activeTab, setActiveTab] = useState<'prep' | 'recipes' | 'ai-parser' | 'wire' | 'branding'>('prep');
  const [recipeSubTab, setRecipeSubTab] = useState<'costing' | 'subrecipes' | 'builder'>('costing');

  // White-label details
  const [brandName, setBrandName] = useState(() => localStorage.getItem('miseos_brand_name') || 'MiseOS');
  const [subTitle, setSubTitle] = useState(() => localStorage.getItem('miseos_sub_title') || 'Back-of-House Kitchen Coordination System');
  const [themeAccent, setThemeAccent] = useState(() => localStorage.getItem('miseos_theme_accent') || '#C47E5A');
  const [facilityCode, setFacilityCode] = useState(() => localStorage.getItem('miseos_facility_code') || 'THE PASS');
  const [chefOnDuty, setChefOnDuty] = useState(() => localStorage.getItem('miseos_chef_on_duty') || 'Chef de Cuisine');

  useEffect(() => {
    document.documentElement.style.setProperty('--color-accent', themeAccent);
    localStorage.setItem('miseos_theme_accent', themeAccent);
  }, [themeAccent]);

  useEffect(() => {
    localStorage.setItem('miseos_brand_name', brandName);
  }, [brandName]);

  useEffect(() => {
    localStorage.setItem('miseos_sub_title', subTitle);
  }, [subTitle]);

  useEffect(() => {
    localStorage.setItem('miseos_facility_code', facilityCode);
  }, [facilityCode]);

  useEffect(() => {
    localStorage.setItem('miseos_chef_on_duty', chefOnDuty);
  }, [chefOnDuty]);

  // Currently Selected Recipe for Details Panel
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(INITIAL_RECIPES[0]?.id || '');

  // Sub-recipes State
  const [subRecipes, setSubRecipes] = useState<SubRecipe[]>(() => {
    const saved = localStorage.getItem('miseos_subrecipes');
    return saved ? JSON.parse(saved) : INITIAL_SUB_RECIPES;
  });
  const [selectedSubRecipeId, setSelectedSubRecipeId] = useState<string>(INITIAL_SUB_RECIPES[0]?.id || '');
  const [subRecipeScaler, setSubRecipeScaler] = useState<number>(1.0);

  // Form State: Add Prep Item
  const [newPrepName, setNewPrepName] = useState('');
  const [newPrepQty, setNewPrepQty] = useState('');
  const [newPrepUnit, setNewPrepUnit] = useState('g');
  const [newPrepStation, setNewPrepStation] = useState<PrepStation>('Sauté');
  const [newPrepPriority, setNewPrepPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newPrepNotes, setNewPrepNotes] = useState('');

  // Form State: Add Recipe Modifier
  const [customSalePrice, setCustomSalePrice] = useState<number | undefined>(undefined);

  // Form State: Add Timer
  const [newTimerLabel, setNewTimerLabel] = useState('');
  const [newTimerMins, setNewTimerMins] = useState(5);
  const [newTimerStation, setNewTimerStation] = useState<PrepStation>('Sauté');

  // Form State: Shift Handover
  const [newLogSender, setNewLogSender] = useState('');
  const [newLogStation, setNewLogStation] = useState<PrepStation | 'All'>('All');
  const [newLogSeverity, setNewLogSeverity] = useState<'info' | 'warning' | 'critical'>('info');
  const [newLogMsg, setNewLogMsg] = useState('');

  // Form State: 86 Modifier
  const [new86Name, setNew86Name] = useState('');
  const [new86Status, setNew86Status] = useState<'out' | 'limited'>('out');
  const [new86Substitute, setNew86Substitute] = useState('');

  // --- SUBRECIPE BUILDER WORKSPACE STATES ---
  const [subBuilderName, setSubBuilderName] = useState('');
  const [subBuilderStation, setSubBuilderStation] = useState<PrepStation>('Sauté');
  const [subBuilderBatchSize, setSubBuilderBatchSize] = useState<string>('1.0');
  const [subBuilderUnit, setSubBuilderUnit] = useState('kg');
  const [subBuilderIngredients, setSubBuilderIngredients] = useState<Ingredient[]>([]);
  const [subBuilderSteps, setSubBuilderSteps] = useState<string[]>([]);
  
  const [subIngName, setSubIngName] = useState('');
  const [subIngQty, setSubIngQty] = useState('');
  const [subIngUnit, setSubIngUnit] = useState('kg');
  const [subIngCost, setSubIngCost] = useState('');
  const [subIngYield, setSubIngYield] = useState<string>('100');
  const [subIngPurchaseUnit, setSubIngPurchaseUnit] = useState('kg');
  const [subStepText, setSubStepText] = useState('');

  // --- PARENT RECIPE BUILDER WORKSPACE STATES ---
  const [builderName, setBuilderName] = useState('');
  const [builderStation, setBuilderStation] = useState<PrepStation>('Sauté');
  const [builderOriginalCovers, setBuilderOriginalCovers] = useState<string>('4');
  const [builderPrice, setBuilderPrice] = useState<string>('15.00');
  const [builderIngredients, setBuilderIngredients] = useState<Ingredient[]>([]);
  const [builderSteps, setBuilderSteps] = useState<string[]>([]);
  const [builderTimeMinutes, setBuilderTimeMinutes] = useState<string>('30');
  const [builderStatus, setBuilderStatus] = useState<'Draft' | 'Active' | 'Archived'>('Active');
  const [builderMenuSection, setBuilderMenuSection] = useState<'Apps' | 'Mains' | 'Desserts' | 'Sides'>('Mains');
  const [builderTargetFoodCostPercentage, setBuilderTargetFoodCostPercentage] = useState<string>('28');
  const [builderTags, setBuilderTags] = useState<string[]>([]);
  const [builderTagInput, setBuilderTagInput] = useState<string>('');
  const [builderAllergens, setBuilderAllergens] = useState<string[]>([]);

  const [builderIngName, setBuilderIngName] = useState('');
  const [builderIngQty, setBuilderIngQty] = useState('');
  const [builderIngUnit, setBuilderIngUnit] = useState('kg');
  const [builderIngCost, setBuilderIngCost] = useState('');
  const [builderIngYield, setBuilderIngYield] = useState<string>('100');
  const [builderIngPurchaseUnit, setBuilderIngPurchaseUnit] = useState('kg');
  const [builderStepText, setBuilderStepText] = useState('');
  const [builderError, setBuilderError] = useState('');

  // AI Unstructured Parser State
  const [rawRecipeText, setRawRecipeText] = useState(
    `10 portions of Prime Salmon Tartar.\nNeed Sauté station coverage.\nGet 1.5kg high-grade Atlantic Salmon Fillets (costs about $36.00/kg, clean yield is 80% after skin/fat removal).\nUse 200g Fresh Avocado dice ($9.00/kg, clean yield 70% post pitted/scooped).\nShallots 100g ($5.00/kg, yield 92%).\nFresh Lemons 3 pcs ($0.45 each, 100% yield for flavoring).\nOlive oil cold drizzle 50ml ($14.00/L).\n\nSteps:\n1. Chill salmon in bone freezer before cold-cubing (1/8 inch).\n2. Gently incorporate scooping avocados with high acid juice to prevent oxidization brown out.\n3. Whisk shallots & organic oil, spoon cleanly onto plating molds. Chive decoration.`
  );
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [parsedRecipeResult, setParsedRecipeResult] = useState<Recipe | null>(null);

  // Sound Utility Settings
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // --- LOCAL PERSISTENCE SYNC ---
  useEffect(() => {
    localStorage.setItem('miseos_prep_items', JSON.stringify(prepItems));
  }, [prepItems]);

  useEffect(() => {
    localStorage.setItem('miseos_timers', JSON.stringify(timers));
  }, [timers]);

  useEffect(() => {
    localStorage.setItem('miseos_recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('miseos_handovers', JSON.stringify(handovers));
  }, [handovers]);

  useEffect(() => {
    localStorage.setItem('miseos_86_items', JSON.stringify(items86));
  }, [items86]);

  useEffect(() => {
    localStorage.setItem('miseos_subrecipes', JSON.stringify(subRecipes));
  }, [subRecipes]);

  // Auto-scan allergens on ingredient modification
  useEffect(() => {
    const commonAllergensMap = {
      gluten: ["flour", "wheat", "bread", "panko", "gluten", "pasta", "semolina", "crust", "soy sauce", "soy-sauce", "tortilla"],
      dairy: ["butter", "milk", "cream", "cheese", "parmesan", "yogurt", "whey", "mascarpone", "ghee"],
      shellfish: ["shrimp", "lobster", "crab", "prawn", "oyster", "clam", "scallop", "mussel"],
      nuts: ["almond", "walnut", "peanut", "cashew", "pecan", "hazelnut", "pistachio"],
      soy: ["soy", "tofu", "shoyu", "tamari", "edamame"],
      egg: ["egg", "yolk", "mayo", "bacon" , "meringue", "aioli", "custard"],
      fish: ["salmon", "cod", "tuna", "halibut", "snapper", "anchovy", "bass", "fish", "trout"],
      sesame: ["sesame", "tahini"]
    };

    const identified: string[] = [];
    builderIngredients.forEach((ing) => {
      const nameLower = ing.name.toLowerCase();
      Object.entries(commonAllergensMap).forEach(([allergen, keywords]) => {
        if (keywords.some(k => nameLower.includes(k))) {
          const capitalized = allergen.charAt(0).toUpperCase() + allergen.slice(1);
          if (!identified.includes(capitalized)) {
            identified.push(capitalized);
          }
        }
      });
    });

    if (identified.length > 0) {
      setBuilderAllergens(prev => {
        const union = new Set([...prev, ...identified]);
        return Array.from(union);
      });
    }
  }, [builderIngredients]);

  // --- AUDIO ALARM EFFECT ---
  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitched double beep
      osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      console.warn("Audio Context init blocked or failed due to standard browser gesture restrictions:", e);
    }
  };

  // --- TIMER BACKGROUND COUNTDOWN ---
  useEffect(() => {
    const timerInterval = setInterval(() => {
      let triggeredAlarm = false;

      setTimers((prev) =>
        prev.map((t) => {
          if (t.status === 'running') {
            const nextElapsed = t.elapsedMs + 1000;
            if (nextElapsed >= t.durationMs) {
              triggeredAlarm = true;
              return { ...t, elapsedMs: t.durationMs, status: 'alarm' };
            }
            return { ...t, elapsedMs: nextElapsed };
          }
          return t;
        })
      );

      if (triggeredAlarm) {
        playAlertSound();
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [soundEnabled]);

  // Periodic alert chime if any timer is actively set to alarm status
  useEffect(() => {
    const alarmActive = timers.some((t) => t.status === 'alarm');
    let alarmNoiseInterval: NodeJS.Timeout | null = null;
    if (alarmActive && soundEnabled) {
      alarmNoiseInterval = setInterval(() => {
        playAlertSound();
      }, 1500);
    }
    return () => {
      if (alarmNoiseInterval) clearInterval(alarmNoiseInterval);
    };
  }, [timers, soundEnabled]);

  // --- DYNAMIC CALCULATOR & PREP SHEET HELPERS ---
  const currentPrepList = prepItems.filter(
    (item) => currentStation === 'All' || item.assignedStation === currentStation
  );

  const completedCount = prepItems.filter((i) => i.checked).length;
  const currentAlarmsCount = timers.filter((t) => t.status === 'alarm').length;

  const handleTogglePrep = (id: string) => {
    setPrepItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, checked: !i.checked, lastModified: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
          : i
      )
    );
  };

  const handleDeletePrep = (id: string) => {
    setPrepItems((prev) => prev.filter((i) => i.id !== id));
  };

  // --- FORM HANDLERS ---
  const handleAddPrep = (e: FormEvent) => {
    e.preventDefault();
    if (!newPrepName.trim() || !newPrepQty.trim()) return;

    const newItem: PrepItem = {
      id: `p-custom-${Date.now()}`,
      name: newPrepName.trim(),
      quantity: newPrepQty,
      unit: newPrepUnit,
      checked: false,
      assignedStation: newPrepStation,
      priority: newPrepPriority,
      notes: newPrepNotes.trim() || undefined,
      lastModified: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setPrepItems((prev) => [newItem, ...prev]);
    setNewPrepName('');
    setNewPrepQty('');
    setNewPrepNotes('');
  };

  // Timer modifiers
  const handleStartTimer = (id: string) => {
    setTimers((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'running' } : t)));
    // Initialize user gesture audio context
    if (soundEnabled && !audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const handlePauseTimer = (id: string) => {
    setTimers((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'paused' } : t)));
  };

  const handleResetTimer = (id: string) => {
    setTimers((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'idle', elapsedMs: 0 } : t)));
  };

  const handleDeleteTimer = (id: string) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddTimer = (e: FormEvent) => {
    e.preventDefault();
    if (!newTimerLabel.trim() || newTimerMins <= 0) return;

    const newT: KitchenTimer = {
      id: `t-custom-${Date.now()}`,
      label: newTimerLabel.trim(),
      durationMs: newTimerMins * 60 * 1000,
      elapsedMs: 0,
      status: 'idle',
      station: newTimerStation
    };

    setTimers((prev) => [...prev, newT]);
    setNewTimerLabel('');
  };

  // Handover modifiers
  const handleToggleHandoverResolve = (id: string) => {
    setHandovers((prev) => prev.map((h) => (h.id === id ? { ...h, resolved: !h.resolved } : h)));
  };

  const handleAddHandover = (e: FormEvent) => {
    e.preventDefault();
    if (!newLogMsg.trim() || !newLogSender.trim()) return;

    const newH: HandoverLog = {
      id: `h-custom-${Date.now()}`,
      sender: newLogSender.trim(),
      station: newLogStation,
      severity: newLogSeverity,
      message: newLogMsg.trim(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      resolved: false
    };

    setHandovers((prev) => [newH, ...prev]);
    setNewLogMsg('');
  };

  const handleDeleteHandover = (id: string) => {
    setHandovers((prev) => prev.filter((h) => h.id !== id));
  };

  // 86 modifiers
  const handleAdd86 = (e: FormEvent) => {
    e.preventDefault();
    if (!new86Name.trim()) return;

    const new86: Item86 = {
      id: `86-custom-${Date.now()}`,
      name: new86Name.trim(),
      status: new86Status,
      substitute: new86Substitute.trim() || undefined,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setItems86((prev) => [new86, ...prev]);
    setNew86Name('');
    setNew86Substitute('');
  };

  const handleDelete86 = (id: string) => {
    setItems86((prev) => prev.filter((item) => item.id !== id));
  };

  // --- SERVERSIDE AI recipe transcription parser handler ---
  const handleRequestRecipeAIExtract = async () => {
    if (!rawRecipeText.trim()) return;
    setApiLoading(true);
    setApiError(null);
    setParsedRecipeResult(null);

    try {
      const response = await fetch('/api/parse-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeText: rawRecipeText })
      });

      if (!response.ok) {
        throw new Error(`Server returned error status code: ${response.status}`);
      }

      const resData = await response.json();
      if (resData && resData.success && resData.data) {
        // Enforce valid recipe format ID locally
        const apiRecipe: Recipe = {
          ...resData.data,
          id: `rc-ai-${Date.now()}`,
          targetCovers: resData.data.originalCovers || 4
        };
        setParsedRecipeResult(apiRecipe);
      } else {
        throw new Error(resData?.error || 'Malformed API response structural mismatch.');
      }
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'Fatal communication mismatch while pulling AI parsing schemas.');
    } finally {
      setApiLoading(false);
    }
  };

  const handleAppendParsedRecipe = () => {
    if (!parsedRecipeResult) return;
    setRecipes((prev) => [...prev, parsedRecipeResult]);
    setSelectedRecipeId(parsedRecipeResult.id);
    setActiveTab('recipes');
    setParsedRecipeResult(null);
  };

  // Recipe scaling modifiers
  const handleScaleCovers = (recipeId: string, delta: number) => {
    setRecipes((prev) =>
      prev.map((r) => {
        if (r.id === recipeId) {
          const next = Math.max(1, r.targetCovers + delta);
          return { ...r, targetCovers: next };
        }
        return r;
      })
    );
  };

  const handleSetCoversDirectly = (recipeId: string, val: number) => {
    setRecipes((prev) =>
      prev.map((r) => {
        if (r.id === recipeId) {
          return { ...r, targetCovers: Math.max(1, val) };
        }
        return r;
      })
    );
  };

  // --- FIND RELEVANT RECIPE AND COST DETAILS ---
  const activeRecipe = recipes.find((r) => r.id === selectedRecipeId) || recipes[0];
  const costCalculations = activeRecipe
    ? calculateRecipeCostDetails(activeRecipe, activeRecipe.targetCovers, subRecipes)
    : null;

  // --- SUBRECIPE COST DETAILS HELPER & DERIVED STATES ---
  const getSubRecipeCostDetails = (sr: SubRecipe) => {
    let totalCost = 0;
    const detailedIngredients = sr.ingredients.map((ing) => {
      const rawQtyNeeded = calculateRawQuantity(ing.quantity, ing.yieldPercent);
      const cost = rawQtyNeeded * ing.costPerUnit;
      totalCost += cost;
      return {
        ...ing,
        rawQtyNeeded,
        cost
      };
    });
    const costPerUnit = totalCost / (sr.batchSize || 1);
    return {
      totalCost,
      costPerUnit,
      detailedIngredients
    };
  };

  const activeSubRecipe = subRecipes.find((sr) => sr.id === selectedSubRecipeId) || subRecipes[0];
  const subRecipeDetails = activeSubRecipe ? getSubRecipeCostDetails(activeSubRecipe) : null;

  // Filter recipes based on header selection for organization
  const filteredRecipesList = recipes.filter(
    (r) => currentStation === 'All' || r.station === currentStation
  );

  return (
    <div id="miseos-root-wrapper" className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-red-600 selection:text-white pb-12">
      <StationPassHeader
        currentStation={currentStation}
        setCurrentStation={setCurrentStation}
        totalPrepCount={prepItems.length}
        completedPrepCount={completedCount}
        activeAlarmsCount={currentAlarmsCount}
        item86Count={items86.length}
        brandName={brandName}
        subTitle={subTitle}
        facilityCode={facilityCode}
      />

      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. UNIFIED APP ROUTING SIDEBAR & BRAND CONTAINER */}
        <section id="miseos-unified-sidebar-nav" className="col-span-1 lg:col-span-3 flex flex-col gap-5">
          
          {/* WHITE LABEL IDENTITY CARD */}
          <div className="bg-white border border-[#E6E6E6] rounded-xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0F172A] flex items-center justify-center shadow-lg border border-[#1E293B]">
                <Settings className="w-5 h-5 text-emerald-400 animate-spin-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-mono font-black tracking-tight text-[#0F172A] uppercase truncate max-w-[150px]">
                  {brandName}
                </h3>
                <p className="text-[10px] text-zinc-500 font-mono tracking-tight uppercase">
                  {facilityCode}
                </p>
              </div>
            </div>
            
            <div className="border-t border-[#E6E6E6] pt-2.5 flex flex-col gap-1.5 text-[10px] font-mono">
              <div className="flex justify-between items-center text-zinc-500">
                <span>Duty Chef:</span>
                <span className="font-bold text-[#0F172A] truncate max-w-[110px]">{chefOnDuty}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-500">
                <span>Station Pass:</span>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-1.5 py-0.5 text-[8px] uppercase font-bold tracking-wider">ACTIVE</span>
              </div>
            </div>
          </div>

          {/* APP SEGMENT ROUTING BAR */}
          <div className="bg-white border border-[#E6E6E6] rounded-xl p-3 shadow-sm flex flex-col gap-1.5">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2.5 mb-1 block">
              WORKSTATIONS
            </span>
            
            <button
              id="sidebar-tab-prep"
              onClick={() => setActiveTab('prep')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-3 border ${
                activeTab === 'prep'
                  ? 'bg-[#0F172A] border-[#1E293B] text-emerald-400 shadow-sm'
                  : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-50 border-transparent'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Mise en Place</span>
            </button>

            <button
              id="sidebar-tab-recipes"
              onClick={() => setActiveTab('recipes')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-3 border ${
                activeTab === 'recipes'
                  ? 'bg-[#0F172A] border-[#1E293B] text-emerald-400 shadow-sm'
                  : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-50 border-transparent'
              }`}
            >
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Recipes & Costing</span>
            </button>

            <button
              id="sidebar-tab-ai-parser"
              onClick={() => setActiveTab('ai-parser')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-3 border ${
                activeTab === 'ai-parser'
                  ? 'bg-[#0F172A] border-[#1E293B] text-emerald-400 shadow-sm'
                  : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-50 border-transparent'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>AI Extractor</span>
            </button>

            <button
              id="sidebar-tab-wire"
              onClick={() => setActiveTab('wire')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-3 border ${
                activeTab === 'wire'
                  ? 'bg-[#0F172A] border-[#1E293B] text-emerald-400 shadow-sm'
                  : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-50 border-transparent'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-emerald-600" />
              <span>Pass & 86 List</span>
            </button>

            <button
              id="sidebar-tab-branding"
              onClick={() => setActiveTab('branding')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-3 border ${
                activeTab === 'branding'
                  ? 'bg-[#0F172A] border-[#1E293B] text-emerald-400 shadow-sm'
                  : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-50 border-transparent'
              }`}
            >
              <Settings className="w-4 h-4 text-emerald-600" />
              <span>Brand Center</span>
            </button>
          </div>

          {/* ACTIVE KITCHEN LINE MULTI-TIMERS */}
          <div id="kitchen-timers-pane" className="bg-brand-surface border border-brand-border rounded-xl p-4 flex flex-col gap-3 shadow-md">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-2.5">
              <h2 className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-accent flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-brand-accent animate-spin-pulse" /> LINE TIMERS
              </h2>
              
              {/* Audio Toggle Toggle Button */}
              <button
                id="toggle-audio-alert"
                type="button"
                onClick={() => setSoundEnabled((prev) => !prev)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border transition-all cursor-pointer ${
                  soundEnabled
                    ? 'bg-brand-accent/10 border-brand-accent text-brand-accent'
                    : 'bg-brand-bg border-brand-border text-brand-muted hover:text-brand-text'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                {soundEnabled ? 'Live ON' : 'Muted'}
              </button>
            </div>

            {/* Timers list filtered by active station */}
            <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
              {timers
                .filter((t) => currentStation === 'All' || t.station === currentStation)
                .map((t) => {
                  const remaining = t.durationMs - t.elapsedMs;
                  const progressPct = Math.min(100, (t.elapsedMs / t.durationMs) * 100);
                  const isAlarming = t.status === 'alarm';

                  return (
                    <div
                      id={`line-timer-card-${t.id}`}
                      key={t.id}
                      className={`p-2.5 rounded-lg border transition-all ${
                        isAlarming
                          ? 'bg-brand-accent/15 border-brand-accent shadow-md shadow-brand-accent/15 animate-pulse'
                          : 'bg-brand-bg border-brand-border'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1 pb-1">
                        <div>
                          <h4 className="text-[10px] font-mono font-bold text-brand-text uppercase tracking-tight truncate max-w-[110px]">
                            {t.label}
                          </h4>
                          <div className="flex gap-1.5 items-center mt-0.5">
                            <span className="text-[8px] font-mono bg-brand-surface border border-brand-border font-bold uppercase px-1 rounded text-brand-muted">
                              {t.station}
                            </span>
                          </div>
                        </div>

                        {/* Digital countdown digits */}
                        <span className={`text-xs font-mono font-bold tracking-wider tabular-nums ${
                          isAlarming ? 'text-brand-accent animate-pulse' : 'text-brand-accent'
                        }`}>
                          {formatMs(remaining)}
                        </span>
                      </div>

                      {/* Simple Progress bar */}
                      <div className="w-full bg-brand-border h-1 rounded-full overflow-hidden mt-1 mb-1.5">
                        <div
                          className="h-full transition-all duration-1000 bg-brand-accent"
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>

                      <div className="flex gap-1 justify-end">
                        {t.status === 'idle' || t.status === 'paused' ? (
                          <button
                            id={`timer-btn-start-${t.id}`}
                            onClick={() => handleStartTimer(t.id)}
                            className="bg-brand-surface hover:opacity-90 text-brand-accent border border-brand-border rounded px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase cursor-pointer"
                          >
                            Play
                          </button>
                        ) : (
                          t.status === 'running' && (
                            <button
                              id={`timer-btn-pause-${t.id}`}
                              onClick={() => handlePauseTimer(t.id)}
                              className="bg-brand-surface hover:opacity-90 text-brand-accent border border-brand-border rounded px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase cursor-pointer"
                            >
                              Hold
                            </button>
                          )
                        )}

                        <button
                          id={`timer-btn-reset-${t.id}`}
                          onClick={() => handleResetTimer(t.id)}
                          className="bg-brand-surface hover:opacity-90 text-brand-muted border border-brand-border rounded px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase cursor-pointer"
                        >
                          Clear
                        </button>

                        <button
                          id={`timer-btn-delete-${t.id}`}
                          onClick={() => handleDeleteTimer(t.id)}
                          className="p-1 hover:bg-brand-accent/25 text-brand-muted hover:text-brand-accent rounded transition-colors cursor-pointer"
                          title="Discard"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

              {timers.filter((t) => currentStation === 'All' || t.station === currentStation).length === 0 && (
                <div className="text-center py-4 text-[10px] text-brand-muted font-mono italic">
                  No active timers for {currentStation}.
                </div>
              )}
            </div>

            {/* Quick Add Timer Form */}
            <form onSubmit={handleAddTimer} className="mt-1 pt-3 border-t border-brand-border/60 flex flex-col gap-1.5">
              <input
                id="input-timer-label"
                type="text"
                placeholder="simmer, cod bake"
                value={newTimerLabel}
                onChange={(e) => setNewTimerLabel(e.target.value)}
                className="bg-brand-bg border border-brand-border text-[10px] px-2 py-1 rounded text-brand-text font-mono focus:outline-none focus:border-brand-accent"
              />
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  id="input-timer-mins"
                  type="number"
                  min="1"
                  max="1440"
                  value={newTimerMins}
                  onChange={(e) => setNewTimerMins(parseInt(e.target.value) || 5)}
                  className="bg-brand-bg border border-brand-border text-[10px] px-1 py-1 rounded text-brand-text font-mono focus:outline-none focus:border-brand-accent"
                  placeholder="min"
                />
                <select
                  id="select-timer-station"
                  value={newTimerStation}
                  onChange={(e) => setNewTimerStation(e.target.value as PrepStation)}
                  className="bg-brand-bg border border-brand-border text-[10px] px-1 py-1 rounded font-mono text-brand-muted focus:outline-none focus:border-brand-accent"
                >
                  <option value="Sauté">Sauté</option>
                  <option value="Grill">Grill</option>
                  <option value="Garde Manger">Garde Manger</option>
                  <option value="Pastry">Pastry</option>
                </select>
              </div>
              <button
                id="btn-add-timer"
                type="submit"
                className="bg-brand-accent hover:opacity-90 text-white font-mono uppercase text-[9px] font-bold py-1 rounded border border-brand-accent transition-all cursor-pointer"
              >
                + Ignite Timer
              </button>
            </form>
          </div>
        </section>

        {/* 2. MAIN WORKSPACE / CONTENT VIEWPORT FOR SELECTED ACTIONS */}
        <section id="main-workstation-panel" className="col-span-1 lg:col-span-9 flex flex-col gap-5">
          
          {/* MOBILE RESPONSIVE NAVIGATION TOOLBAR (KEEPS APP FULLY ACCESSIBLE ON TABLET/MOBILE) */}
          <div className="lg:hidden bg-white border border-[#E6E6E6] p-1 rounded-xl flex gap-1 overflow-x-auto scrollbar-none shadow-sm">
            <button
              onClick={() => setActiveTab('prep')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-tight whitespace-nowrap transition-all ${
                activeTab === 'prep' ? 'bg-[#0F172A] text-emerald-400 border border-emerald-500/20' : 'text-slate-600 hover:text-[#0F172A]'
              }`}
            >
              Mise en Place
            </button>
            <button
              onClick={() => setActiveTab('recipes')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-tight whitespace-nowrap transition-all ${
                activeTab === 'recipes' ? 'bg-[#0F172A] text-emerald-400 border border-emerald-500/20' : 'text-slate-600 hover:text-[#0F172A]'
              }`}
            >
              Recipes & Costing
            </button>
            <button
              onClick={() => setActiveTab('ai-parser')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-tight whitespace-nowrap transition-all ${
                activeTab === 'ai-parser' ? 'bg-[#0F172A] text-emerald-400 border border-emerald-500/20' : 'text-slate-600 hover:text-[#0F172A]'
              }`}
            >
              AI Extractor
            </button>
            <button
              onClick={() => setActiveTab('wire')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-tight whitespace-nowrap transition-all ${
                activeTab === 'wire' ? 'bg-[#0F172A] text-emerald-400 border border-emerald-500/20' : 'text-slate-600 hover:text-[#0F172A]'
              }`}
            >
              Pass & 86
            </button>
            <button
              onClick={() => setActiveTab('branding')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-tight whitespace-nowrap transition-all ${
                activeTab === 'branding' ? 'bg-[#0F172A] text-emerald-400 border border-emerald-500/20' : 'text-slate-600 hover:text-[#0F172A]'
              }`}
            >
              Brand Center
            </button>
          </div>

          <ErrorBoundary fallbackTitle="Workstation Panel Error">
            
            {/* TAB 1: MISE EN PLACE BACK OF HOUSE PREP LIST */}
            {activeTab === 'prep' && (
              <div id="prep-sheet-tab-content" className="flex flex-col gap-4">
                
                {/* Active prep lists state view */}
                <div className="bg-brand-surface border border-brand-border rounded-xl p-4 shadow-md">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-800/80 pb-3 mb-4">
                    <div>
                      <h3 className="text-base font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-1.5">
                        <CheckCircle className="w-5 h-5 text-red-500" /> Prep Checklist ({currentPrepList.length})
                      </h3>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">
                        Showing line items for <span className="text-red-400 font-bold">{currentStation}</span> Station
                      </p>
                    </div>

                    {/* Progress tracking badge */}
                    <div className="bg-zinc-950 border border-zinc-800 px-3 py-1 rounded text-xs font-mono text-zinc-400">
                      Completed: <span className="text-emerald-400 font-bold">{currentPrepList.filter(i => i.checked).length}</span>/{currentPrepList.length}
                    </div>
                  </div>

                  {/* List items */}
                  <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
                    {currentPrepList.map((item) => {
                      const isHigh = item.priority === 'high';
                      const isMedium = item.priority === 'medium';

                      return (
                        <div
                          id={`prep-item-row-${item.id}`}
                          key={item.id}
                          className={`flex items-center justify-between p-3.5 rounded-lg border transition-all ${
                            item.checked
                              ? 'bg-zinc-950/40 border-zinc-900/60 opacity-60'
                              : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-start gap-3.5 flex-grow">
                            {/* Bullet check checkbox */}
                            <button
                              id={`prep-checkbox-toggle-${item.id}`}
                              onClick={() => handleTogglePrep(item.id)}
                              className="mt-1 flex-shrink-0 text-zinc-500 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                item.checked
                                  ? 'bg-red-600 border-red-500 text-white'
                                  : 'border-zinc-700 hover:border-zinc-505'
                              }`}>
                                {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </button>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xs font-mono font-bold uppercase tracking-tight ${
                                  item.checked ? 'text-zinc-500 line-through font-normal' : 'text-zinc-200'
                                }`}>
                                  {item.name}
                                </span>

                                {/* Priority Badge */}
                                <span className={`text-[8px] font-mono tracking-wider font-extrabold uppercase px-1.5 py-0.2 rounded ${
                                  isHigh
                                    ? 'bg-red-950 text-red-400 border border-red-900'
                                    : isMedium
                                    ? 'bg-amber-950 text-amber-500 border border-amber-900'
                                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                }`}>
                                  {item.priority}
                                </span>

                                {/* Station tag if viewing 'All' */}
                                {currentStation === 'All' && (
                                  <span className="text-[8px] font-mono bg-zinc-900 border border-zinc-800 font-bold px-1 rounded text-zinc-400">
                                    {item.assignedStation}
                                  </span>
                                )}
                              </div>

                              {item.notes && (
                                <p className="text-[11px] font-mono text-zinc-400 mt-1 leading-relaxed border-l border-zinc-800/85 pl-2">
                                  {item.notes}
                                </p>
                              )}

                              <span className="text-[9px] font-mono text-zinc-500 block mt-1">
                                Last touch: {item.lastModified}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 ml-2">
                            {/* Quantity label */}
                            <div className="text-right">
                              <span className="text-xs font-mono font-extrabold text-white">
                                {item.quantity}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-400 block -mt-0.5">
                                {item.unit}
                              </span>
                            </div>

                            {/* Delete action button */}
                            <button
                              id={`prep-delete-${item.id}`}
                              onClick={() => handleDeletePrep(item.id)}
                              className="text-zinc-600 hover:text-red-500 p-1.5 rounded transition-colors cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {currentPrepList.length === 0 && (
                      <div className="text-center py-12 text-zinc-500 font-mono italic">
                        No active prep items for {currentStation} station.
                      </div>
                    )}
                  </div>
                </div>

                {/* Form to Spawn New Prep */}
                <form onSubmit={handleAddPrep} className="bg-zinc-900/60 border border-zinc-900 rounded-xl p-4 shadow-md">
                  <h4 className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest border-b border-zinc-800/80 pb-2 mb-3 flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-red-500" /> REGISTER NEW PREP RUN
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2 flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase">PREP DESCRIPTION</label>
                      <input
                        id="input-prep-name"
                        type="text"
                        placeholder="e.g. Brunoise shallots, portion dry beef"
                        value={newPrepName}
                        onChange={(e) => setNewPrepName(e.target.value)}
                        className="bg-zinc-950 border border-zinc-850 text-xs px-3 py-2 rounded font-mono text-white focus:outline-none focus:border-red-500 placeholder-zinc-600"
                        required
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase">QTY AMOUNT</label>
                      <input
                        id="input-prep-qty"
                        type="text"
                        placeholder="e.g. 2.5, 15, whole case"
                        value={newPrepQty}
                        onChange={(e) => setNewPrepQty(e.target.value)}
                        className="bg-zinc-950 border border-zinc-850 text-xs px-3 py-2 rounded font-mono text-white focus:outline-none focus:border-red-500 placeholder-zinc-600"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase">UNIT TYPE</label>
                      <input
                        id="input-prep-unit"
                        type="text"
                        placeholder="e.g. kg, lbs, portions, pans"
                        value={newPrepUnit}
                        onChange={(e) => setNewPrepUnit(e.target.value)}
                        className="bg-zinc-950 border border-zinc-850 text-xs px-3 py-2 rounded font-mono text-white focus:outline-none placeholder-zinc-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase">STATION ASSIGNED</label>
                      <select
                        id="select-prep-station"
                        value={newPrepStation}
                        onChange={(e) => setNewPrepStation(e.target.value as PrepStation)}
                        className="bg-zinc-950 border border-zinc-850 text-xs px-3 py-2 rounded font-mono text-white focus:outline-none"
                      >
                        <option value="Sauté">Sauté</option>
                        <option value="Grill">Grill</option>
                        <option value="Garde Manger">Garde Manger</option>
                        <option value="Pastry">Pastry</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase">EXECUTION PRIORITY</label>
                      <select
                        id="select-prep-priority"
                        value={newPrepPriority}
                        onChange={(e) => setNewPrepPriority(e.target.value as 'low' | 'medium' | 'high')}
                        className="bg-zinc-950 border border-zinc-850 text-xs px-3 py-2 rounded font-mono text-white focus:outline-none"
                      >
                        <option value="low">Low PRIORITY</option>
                        <option value="medium">Medium PRIORITY</option>
                        <option value="high">High PRIORITY</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase">ADDITIONAL INSTRUCTION DETAILS</label>
                      <input
                        id="input-prep-notes"
                        type="text"
                        placeholder="e.g. keep covered, wrap with damp cloth"
                        value={newPrepNotes}
                        onChange={(e) => setNewPrepNotes(e.target.value)}
                        className="bg-zinc-950 border border-zinc-850 text-xs px-3 py-2 rounded font-mono text-white focus:outline-none focus:border-red-500 placeholder-zinc-600"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      id="btn-add-prep"
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white border border-red-500 font-mono text-xs font-bold uppercase px-6 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Prep Task
                    </button>
                  </div>
                </form>

              </div>
            )}
                   {/* TAB 2: CULINARY RECIPES WORKSPACE - HIGH GRAPHICS INTERACTION */}
            {activeTab === 'recipes' && (
              <div id="recipes-panel-parent" className="flex flex-col gap-5 w-full">
                        {/* Recipes Navigation Subtabs */}
                <div className="bg-white p-4 border border-[#E6E6E6] rounded-xl flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
                  <div className="px-1 py-0.5">
                    <h3 className="text-xs font-mono font-black uppercase tracking-widest text-[#0F172A] flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-emerald-600 animate-spin-pulse" /> Recipes & Production Workspace
                    </h3>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase mt-1">
                      Failsafe yields • cost ratio trackers • manual compile sheets
                    </p>
                  </div>
                  <div className="flex bg-slate-50 p-1 border border-slate-200 rounded-xl gap-1 shrink-0 overflow-x-auto w-full sm:w-auto">
                    <button
                      id="subtab-plate-costing"
                      onClick={() => setRecipeSubTab('costing')}
                      className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-mono text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                        recipeSubTab === 'costing'
                          ? 'bg-[#0F172A] text-emerald-400 border border-emerald-500/20 shadow-sm'
                          : 'text-slate-600 hover:text-[#0F172A] border border-transparent'
                      }`}
                    >
                      Plate Costing
                    </button>
                    <button
                      id="subtab-subrecipes"
                      onClick={() => setRecipeSubTab('subrecipes')}
                      className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-mono text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                        recipeSubTab === 'subrecipes'
                          ? 'bg-[#0F172A] text-emerald-400 border border-emerald-500/20 shadow-sm'
                          : 'text-slate-600 hover:text-[#0F172A] border border-transparent'
                      }`}
                    >
                      Sub-recipes
                    </button>
                    <button
                      id="subtab-builder"
                      onClick={() => setRecipeSubTab('builder')}
                      className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-mono text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                        recipeSubTab === 'builder'
                          ? 'bg-[#0F172A] text-[#C47E5A] border border-emerald-500/20 shadow-sm'
                          : 'text-slate-600 hover:text-[#0F172A] border border-transparent'
                      }`}
                    >
                      Recipe Builder
                    </button>
                  </div>
                </div>

                {/* SUB TAB 1: PLATE COSTING WRAPPER */}
                {recipeSubTab === 'costing' && (
                  activeRecipe ? (
                    <div id="plate-costing-tab-content" className="grid grid-cols-1 md:grid-cols-12 gap-5">
                      
                      {/* Recipe Selection Sidebar List */}
                      <div className="md:col-span-3 bg-white border border-[#E6E6E6] rounded-xl p-4 flex flex-col gap-3 shadow-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-[#E6E6E6]">
                          <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                            STATION RECIPES
                          </h4>
                        </div>
                        <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
                          {filteredRecipesList.map((r) => {
                            const details = calculateRecipeCostDetails(r, r.originalCovers, subRecipes);
                            const isExcessiveCost = details.foodCostPercentage > 30;

                            return (
                              <button
                                id={`recipe-selector-btn-${r.id}`}
                                key={r.id}
                                onClick={() => {
                                  setSelectedRecipeId(r.id);
                                  setCustomSalePrice(r.salePrice);
                                }}
                                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                                  selectedRecipeId === r.id
                                    ? 'bg-emerald-50/50 border-emerald-300 text-slate-900 shadow-xs ring-1 ring-emerald-300/30'
                                    : 'bg-white border-[#E6E6E6] text-slate-600 hover:text-[#0F172A] hover:bg-slate-50'
                                }`}
                              >
                                <div className="text-xs font-mono font-extrabold truncate">
                                  {r.name}
                                </div>
                                <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t border-slate-100">
                                  <span className="text-[9px] font-mono uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 border border-slate-200 rounded">
                                    {r.station}
                                  </span>
                                  <span className={`text-[9.5px] font-mono font-bold ${
                                    isExcessiveCost ? 'text-rose-600' : 'text-emerald-700'
                                  }`}>
                                    FC%: {details.foodCostPercentage.toFixed(1)}%
                                  </span>
                                </div>
                              </button>
                            );
                          })}

                          {filteredRecipesList.length === 0 && (
                            <div className="text-center py-6 text-xs text-slate-400 font-mono italic">
                              No recipes under {currentStation} station.
                            </div>
                          )}
                        </div>
                      </div>
                                       {/* Primary Recipe Detail, Scaling Panel, & EP vs AP Calculations */}
                      <div className="md:col-span-9 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                        
                        {/* LEFT COLUMN: Recipe Info, Scaling Panel, Ingredients Deep-Dive Table & Execution Steps */}
                        <div className="lg:col-span-7 flex flex-col gap-5">
                          
                          {/* Card 1: Recipe Identity & Scaling Controls */}
                          <div className="spec-card flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-[#E6E6E6] pb-4">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[9px] font-mono text-slate-600 uppercase font-bold">
                                    {activeRecipe.station} STATION
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-400 font-bold">
                                    ID: {activeRecipe.id}
                                  </span>
                                  
                                  {/* Status Badge */}
                                  <span className={`px-2 py-0.5 border rounded text-[9px] font-mono uppercase font-black ${
                                    activeRecipe.status === 'Draft'
                                      ? 'bg-amber-50 border-amber-300 text-amber-700'
                                      : activeRecipe.status === 'Archived'
                                      ? 'bg-slate-100 border-slate-200 text-slate-500'
                                      : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                  }`}>
                                    {activeRecipe.status || 'Active'}
                                  </span>

                                  {/* Menu Section Badge */}
                                  <span className="bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded text-[9px] font-mono text-rose-700 uppercase font-black">
                                    🍽️ {activeRecipe.menuSection || 'Mains'}
                                  </span>
                                  
                                  {/* Prep Time Badge */}
                                  <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[9px] font-mono text-slate-600 flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5 text-slate-500" /> {activeRecipe.timeMinutes || 30} MIN PREP
                                  </span>
                                </div>
                                <h3 className="text-[#0F172A] text-lg font-mono font-black uppercase tracking-tight pt-1">
                                  {activeRecipe.name}
                                </h3>
                                
                                {/* Tags lists */}
                                {activeRecipe.tags && activeRecipe.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 pt-1">
                                    {activeRecipe.tags.map((t, idx) => (
                                      <span key={idx} className="text-[9px] font-mono bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase font-semibold">
                                        #{t}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Dynamic Covers Scaling Buttons */}
                              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-col items-center shrink-0 shadow-xs">
                                <span className="text-[8.5px] font-mono text-slate-500 uppercase tracking-widest font-black">
                                  COVERS SCALING
                                </span>
                                <div className="flex items-center gap-2 mt-2">
                                  <button
                                    id="btn-scale-down"
                                    onClick={() => handleScaleCovers(activeRecipe.id, -1)}
                                    className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-2xs"
                                  >
                                    -
                                  </button>
                                  
                                  <input
                                    id="input-scale-covers-value"
                                    type="number"
                                    min="1"
                                    max="500"
                                    value={activeRecipe.targetCovers}
                                    onChange={(e) => handleSetCoversDirectly(activeRecipe.id, parseInt(e.target.value) || 1)}
                                    className="bg-white border border-slate-200 rounded-lg text-center text-xs font-mono text-emerald-800 font-extrabold w-14 py-1 focus:ring-1 focus:ring-emerald-350 focus:border-emerald-350 focus:outline-none"
                                  />

                                  <button
                                    id="btn-scale-up"
                                    onClick={() => handleScaleCovers(activeRecipe.id, 1)}
                                    className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-2xs"
                                  >
                                    +
                                  </button>
                                </div>
                                <span className="text-[8px] font-mono text-slate-400 mt-1 font-semibold">
                                  Base batch: {activeRecipe.originalCovers}
                                </span>
                              </div>
                            </div>
                          </div>
                                          {/* Card 2: Ingredients Deep-Dive Ledger */}
                          <div className="spec-card flex flex-col gap-3">
                            <h4 className="text-[9.5px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 pb-1">
                              🍽️ ITEMIZATION & SCALE MATRIX
                            </h4>
                            <div className="overflow-x-auto border border-[#E6E6E6] rounded-xl shadow-xs bg-white">
                              <table className="w-full border-collapse text-left text-xs font-mono">
                                <thead className="bg-[#0F172A] border-b border-[#1E293B]">
                                  <tr>
                                    <th className="p-3 text-[9px] text-slate-200 uppercase tracking-widest font-bold">INGREDIENT</th>
                                    <th className="p-3 text-[9px] text-slate-200 uppercase tracking-widest font-bold text-right">EDIBLE QTY (EP)</th>
                                    <th className="p-3 text-[9px] text-slate-200 uppercase tracking-widest font-bold text-center">YIELD %</th>
                                    <th className="p-3 text-[9px] text-slate-200 uppercase tracking-widest font-bold text-right">AP RAW REQ</th>
                                    <th className="p-3 text-[9px] text-slate-200 uppercase tracking-widest font-bold text-right">UNIT RATE</th>
                                    <th className="p-3 text-[9px] text-slate-200 uppercase tracking-widest font-bold text-right">TOTAL COST</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 text-[11px] bg-white">
                                  {costCalculations?.detailedIngredients.map((ing, idx) => {
                                    const isYieldWastage = ing.yieldPercent < 100;

                                    return (
                                      <tr id={`recipe-ingredient-row-${idx}`} key={idx} className="hover:bg-emerald-50/20 transition-colors border-b last:border-0 border-zinc-200">
                                        <td className="p-3 font-bold text-[#0F172A]">
                                          {ing.name}
                                        </td>
                                        <td className="p-3 text-right font-extrabold text-emerald-700">
                                          {ing.scaledQuantity.toFixed(2)} {ing.unit}
                                        </td>
                                        <td className="p-3 text-center">
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            isYieldWastage ? 'text-rose-700 bg-rose-50 border border-rose-200' : 'text-slate-500 bg-slate-100 border border-slate-200'
                                          }`}>
                                            {ing.yieldPercent}%
                                          </span>
                                        </td>
                                        <td className="p-3 text-right text-slate-600 font-bold">
                                          {ing.rawQtyNeeded.toFixed(2)} {ing.unit}
                                        </td>
                                        <td className="p-3 text-right text-slate-505">
                                          ${ing.costPerUnit.toFixed(2)}/{ing.purchaseUnit}
                                        </td>
                                        <td className="p-3 text-right font-black text-[#0F172A]">
                                          $ {ing.cost.toFixed(2)}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Card 3: Execution Steps */}
                          <div className="spec-card flex flex-col gap-3">
                            <h4 className="text-[9.5px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 pb-1 border-b border-slate-100">
                              <FileText className="w-3.5 h-3.5 text-emerald-600" /> BOH COOKING STEPS
                            </h4>
                            <ol className="flex flex-col gap-3 list-decimal list-inside pl-1 text-[11px] leading-relaxed font-mono text-slate-700">
                              {activeRecipe.steps.map((step, idx) => (
                                <li id={`recipe-step-li-${idx}`} key={idx} className="border-b border-slate-100/60 pb-2.5 last:border-0 pl-1">
                                  <span className="text-[#0F172A] font-semibold">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>

                        </div>

                        {/* RIGHT COLUMN: Financial Summary Metrics & Compliance Checks */}
                        <div className="lg:col-span-5 flex flex-col gap-5">
                          
                          {/* Card 4: Financial Ledger Summary */}
                          <div className="spec-card flex flex-col gap-4">
                            <h4 className="text-[9.5px] font-mono font-bold text-slate-500 uppercase tracking-widest pb-1 border-b border-slate-100 flex justify-between items-center">
                              <span>CORE COST INTELLIGENCE</span>
                              <span className="text-[8px] bg-[#0F172A] text-emerald-400 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">PLATE-SYNC</span>
                            </h4>
                            
                            <div className="flex flex-col gap-3">
                              {/* Portions / Batch sizes indicator */}
                              <div className="flex justify-between items-center text-[10px] font-mono bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600">
                                <span>Batch sizing:</span>
                                <span className="font-bold text-[#0F172A]">{activeRecipe.targetCovers} {activeRecipe.targetCovers === 1 ? 'Portion' : 'Portions'}</span>
                              </div>

                              {/* Metric 1: Total Batch Cost (AP) */}
                              <div className="bg-[#FAFAFA] border border-[#E6E6E6] p-4 rounded-xl flex justify-between items-center">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                                    BATCH COST (AP)
                                  </span>
                                  <span className="text-[8.5px] font-mono text-slate-400">
                                    Includes trimmings & waste
                                  </span>
                                </div>
                                <span className="text-xl font-mono font-black text-[#0F172A]">
                                  ${costCalculations?.totalCost.toFixed(2) || '0.00'}
                                </span>
                              </div>

                              {/* Metric 2: Plate Portion Cost (EP) */}
                              <div className="bg-slate-50 border border-[#E6E6E6] p-4 rounded-xl flex justify-between items-center">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                                    PLATE PORTION (EP)
                                  </span>
                                  <span className="text-[8.5px] font-mono text-slate-400">
                                    Edible-portion cost rate
                                  </span>
                                </div>
                                <span className="text-xl font-mono font-black text-rose-700 font-bold">
                                  ${costCalculations?.costPerPortion.toFixed(2) || '0.00'}
                                </span>
                              </div>

                              {/* Metric 3: Food Cost % Controller */}
                              <div className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
                                costCalculations && costCalculations.foodCostPercentage > 30
                                  ? 'bg-rose-50 border-rose-300'
                                  : 'bg-emerald-50/50 border-emerald-300'
                              }`}>
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                                    FOOD COST RATIO
                                  </span>
                                  {costCalculations && costCalculations.foodCostPercentage > 30 && (
                                    <span className="text-[8px] bg-rose-600 text-white font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse shadow-sm">
                                      CRITICAL LIMIT
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex justify-between items-end">
                                  <span className={`text-2xl font-mono font-black ${
                                    costCalculations && costCalculations.foodCostPercentage > 30 ? 'text-rose-700' : 'text-emerald-700'
                                  }`}>
                                    {costCalculations?.foodCostPercentage.toFixed(1) || '0.0'}%
                                  </span>
                                  
                                  {/* Interactive Pricing inputs for Real-Time Recalculations */}
                                  <div className="flex items-center gap-1.5 bg-white border border-[#E6E6E6] rounded-lg px-2 py-1 shadow-2xs">
                                    <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">PRICE: $</span>
                                    <input
                                      id="input-sale-price-recalc"
                                      type="number"
                                      step="0.5"
                                      value={activeRecipe.salePrice || 0}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value) || 0;
                                        setRecipes(prev => prev.map(rec => rec.id === activeRecipe.id ? { ...rec, salePrice: val } : rec));
                                      }}
                                      className="bg-transparent text-xs font-mono text-[#0F172A] font-extrabold rounded w-14 focus:outline-none focus:ring-0 text-right border-0 p-0"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Card 5: Financial Margin Calibrator */}
                          <div className="spec-card flex flex-col gap-4">
                            <h4 className="text-[9.5px] font-mono font-bold text-slate-500 uppercase tracking-widest pb-1 border-b border-slate-100 font-black">
                              FINANCIAL MARGIN CALIBRATOR
                            </h4>

                            <div className="flex flex-col gap-3">
                              <div className="flex justify-between items-center text-[10px] font-mono">
                                <div className="flex flex-col">
                                  <span className="text-[10px] text-slate-500 uppercase">Target Cost Ceiling</span>
                                  <span className="text-xs font-black text-slate-900">{(activeRecipe.targetFoodCostPercentage || 28)}%</span>
                                </div>
                                <div className="text-right flex flex-col">
                                  <span className="text-[10px] text-slate-500 uppercase">Active Variance</span>
                                  <span className={`text-xs font-black ${
                                    costCalculations && costCalculations.foodCostPercentage <= (activeRecipe.targetFoodCostPercentage || 28) ? 'text-emerald-700' : 'text-rose-700'
                                  }`}>
                                    {(costCalculations ? (costCalculations.foodCostPercentage - (activeRecipe.targetFoodCostPercentage || 28)).toFixed(1) : '0.0')}%
                                  </span>
                                </div>
                              </div>
                              
                              {/* Graphic relative cost ratio bar */}
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                                <div 
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    costCalculations && costCalculations.foodCostPercentage <= (activeRecipe.targetFoodCostPercentage || 28)
                                      ? 'bg-emerald-600'
                                      : 'bg-rose-600'
                                  }`}
                                  style={{ width: `${Math.min(100, costCalculations ? (costCalculations.foodCostPercentage / (activeRecipe.targetFoodCostPercentage || 28)) * 100 : 50)}%` }}
                                />
                              </div>

                              <div className="flex justify-center mt-1">
                                <span className={`text-[9px] font-mono font-black px-2 py-1 rounded-md border ${
                                  costCalculations && costCalculations.foodCostPercentage <= (activeRecipe.targetFoodCostPercentage || 28)
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                  {costCalculations && costCalculations.foodCostPercentage <= (activeRecipe.targetFoodCostPercentage || 28) ? '✓ OPTIMAL PROFIT COMPLIANT' : '⚠️ MARGIN WARNING: ADJUST PRICE'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Card 6: Allergens & Safety Warnings */}
                          <div className="spec-card flex flex-col gap-4">
                            <h4 className="text-[9.5px] font-mono font-bold text-slate-500 uppercase tracking-widest pb-1 border-b border-slate-100 flex justify-between items-center">
                              <span>DIETARY SAFETY ALERTS</span>
                              <span className="text-[8px] text-slate-400 font-bold uppercase font-black font-mono">Compliance Catalog</span>
                            </h4>

                            <div className="flex flex-wrap gap-1.5">
                              {activeRecipe.allergens && activeRecipe.allergens.length > 0 ? (
                                activeRecipe.allergens.map((alg, idx) => (
                                  <span key={idx} className="text-[9.5px] font-mono bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-1 rounded-md font-extrabold uppercase tracking-wide flex items-center justify-center">
                                    ⚠️ {alg}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl flex items-center gap-1.5 w-full font-bold uppercase">
                                  ✓ Allergen-Safe / Uncompromised
                                </span>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-zinc-900/40 border border-zinc-900 rounded-xl font-mono text-zinc-400 text-xs">
                      No recipes found. Setup one in the Recipe Builder!
                    </div>
                  )
                )}

                {/* SUB TAB 2: SUB-RECIPES GRAPHICS CONSOLE */}
                {recipeSubTab === 'subrecipes' && (
                  <div id="sub-recipes-tab-content" className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    
                    {/* Sub-recipes Sidebar */}
                    <div className="md:col-span-4 bg-zinc-900/60 border border-zinc-900 rounded-xl p-3 flex flex-col gap-2 shadow-md">
                      <h4 className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-widest px-1 pb-1 border-b border-zinc-800">
                        BASE KITCHEN PREPS & SUB-RECIPES
                      </h4>
                      <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto">
                        {subRecipes.filter(sr => currentStation === 'All' || sr.station === currentStation).map((sr) => {
                          const det = getSubRecipeCostDetails(sr);
                          return (
                            <button
                              id={`subrecipe-selector-btn-${sr.id}`}
                              key={sr.id}
                              onClick={() => {
                                setSelectedSubRecipeId(sr.id);
                                setSubRecipeScaler(1.0);
                              }}
                              className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                                selectedSubRecipeId === sr.id
                                  ? 'bg-zinc-800 border-zinc-700 text-white'
                                  : 'bg-zinc-950/80 border-zinc-850 text-zinc-400 hover:text-zinc-200'
                              }`}
                            >
                              <div className="text-xs font-mono font-bold truncate">
                                {sr.name}
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-[9px] font-mono uppercase bg-zinc-900 px-1 border border-zinc-850 rounded text-zinc-400">
                                  {sr.station}
                                </span>
                                <span className="text-[9px] font-mono text-emerald-400 font-semibold">
                                  Rate: ${det.costPerUnit.toFixed(2)}/{sr.unit}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                        {subRecipes.filter(sr => currentStation === 'All' || sr.station === currentStation).length === 0 && (
                          <div className="text-center py-6 text-xs text-zinc-500 font-mono italic">
                            No preps under {currentStation} station.
                          </div>
                        )}
                      </div>

                      {/* Micro Create Subrecipe form right in sidebar */}
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!subBuilderName.trim()) return;
                        const newSr: SubRecipe = {
                          id: `sr-${Date.now()}`,
                          name: subBuilderName.trim(),
                          station: subBuilderStation,
                          batchSize: parseFloat(subBuilderBatchSize) || 1.0,
                          unit: subBuilderUnit,
                          ingredients: subBuilderIngredients,
                          steps: subBuilderSteps
                        };
                        setSubRecipes(prev => [...prev, newSr]);
                        setSelectedSubRecipeId(newSr.id);
                        setSubBuilderName('');
                        setSubBuilderIngredients([]);
                        setSubBuilderSteps([]);
                        setSubRecipeScaler(1.0);
                      }} className="bg-zinc-955/85 border border-zinc-850 p-2.5 rounded-lg flex flex-col gap-2 mt-2">
                        <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block border-b border-zinc-850 pb-1">
                          + QUICK SUB-RECIPE
                        </span>
                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] font-mono text-zinc-500 uppercase">Prep Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Lime Crema"
                            value={subBuilderName}
                            onChange={(e) => setSubBuilderName(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 text-[11px] px-2 py-1.5 rounded font-mono text-white focus:outline-none focus:border-red-500"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="flex flex-col gap-1">
                            <label className="text-[8px] font-mono text-zinc-500 uppercase">Station</label>
                            <select
                              value={subBuilderStation}
                              onChange={(e) => setSubBuilderStation(e.target.value as PrepStation)}
                              className="bg-zinc-900 border border-zinc-800 text-[10px] p-1 rounded font-mono text-zinc-300"
                            >
                              <option value="Sauté">Sauté</option>
                              <option value="Grill">Grill</option>
                              <option value="Garde Manger">Garde Manger</option>
                              <option value="Pastry">Pastry</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[8px] font-mono text-zinc-400 uppercase">Batch Size</label>
                            <div className="flex gap-1">
                              <input
                                type="text"
                                placeholder="1.0"
                                value={subBuilderBatchSize}
                                onChange={(e) => setSubBuilderBatchSize(e.target.value)}
                                className="bg-zinc-900 border border-zinc-800 text-[10px] w-12 px-1 rounded font-mono text-white text-center"
                              />
                              <input
                                type="text"
                                placeholder="kg"
                                value={subBuilderUnit}
                                onChange={(e) => setSubBuilderUnit(e.target.value)}
                                className="bg-zinc-900 border border-zinc-800 text-[10px] w-10 px-1 rounded font-mono text-zinc-300 text-center"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Ingredients count badge and steps count badge */}
                        <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 pt-0.5">
                          <span>Ingredients: {subBuilderIngredients.length}</span>
                          <span>Steps: {subBuilderSteps.length}</span>
                        </div>

                        {/* Help prompt */}
                        <div className="text-[8px] font-mono text-zinc-500 italic leading-snug">
                          Use Recipe Builder to construct complex components with dynamic lists of resources!
                        </div>

                        <button
                          type="submit"
                          className="bg-red-600 hover:bg-red-700 text-white font-mono text-[9px] font-bold uppercase py-1.5 rounded border border-red-500 mt-1 cursor-pointer transition-all"
                        >
                          Establish Prep Item
                        </button>
                      </form>
                    </div>

                    {/* Sub-recipes Detail pane */}
                    <div className="md:col-span-8 flex flex-col gap-4">
                      {activeSubRecipe ? (
                        <div className="bg-zinc-900/60 border border-zinc-900 rounded-xl p-4 shadow-md">
                          
                          {/* Subrecipe Header */}
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 border-b border-zinc-800/80 pb-3 mb-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="bg-zinc-850 px-2 py-0.5 border border-zinc-800 rounded text-[9px] font-mono text-zinc-400 uppercase">
                                  {activeSubRecipe.station} STATION PREP
                                </span>
                                <span className="text-[9px] font-mono text-zinc-500">
                                  ID: {activeSubRecipe.id}
                                </span>
                              </div>
                              <h3 className="text-base font-mono font-bold uppercase tracking-tight text-white mt-1">
                                {activeSubRecipe.name}
                              </h3>
                            </div>

                            {/* Batch Size Scaling */}
                            <div className="bg-zinc-950 border border-zinc-805 p-2 rounded-lg flex flex-col items-center shrink-0">
                              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
                                BATCH SCALING MULTIPLIER
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <button
                                  type="button"
                                  onClick={() => setSubRecipeScaler(prev => Math.max(0.1, parseFloat((prev - 0.2).toFixed(1))))}
                                  className="w-6 h-6 rounded bg-zinc-905 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-mono flex items-center justify-center cursor-pointer font-bold"
                                >
                                  -
                                </button>
                                <span className="text-xs font-mono text-red-500 font-bold px-1 select-none">
                                  {subRecipeScaler.toFixed(1)}x
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setSubRecipeScaler(prev => parseFloat((prev + 0.2).toFixed(1)))}
                                  className="w-6 h-6 rounded bg-zinc-905 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-mono flex items-center justify-center cursor-pointer font-bold"
                                >
                                  +
                                </button>
                              </div>
                              <span className="text-[8px] font-mono text-zinc-400 mt-0.5">
                                Base batch yield: {activeSubRecipe.batchSize} {activeSubRecipe.unit}
                              </span>
                            </div>
                          </div>

                          {/* Costing Rates metrics */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            <div className="bg-zinc-950 border border-zinc-850 p-3 rounded-lg flex flex-col">
                              <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider">
                                BASE BATCH MATERIAL COST
                              </span>
                              <span className="text-base font-mono font-bold text-white mt-0.5">
                                ${(subRecipeDetails ? subRecipeDetails.totalCost * subRecipeScaler : 0).toFixed(2)}
                              </span>
                              <span className="text-[8px] font-mono text-zinc-400 mt-0.5">
                                Yield value for {(activeSubRecipe.batchSize * subRecipeScaler).toFixed(2)} {activeSubRecipe.unit}
                              </span>
                            </div>

                            <div className="bg-zinc-950 border border-zinc-850 p-3 rounded-lg flex flex-col">
                              <span className="text-[8.5px] font-mono text-zinc-400 uppercase tracking-wider text-emerald-400">
                                CALCULATED YIELD RATE
                              </span>
                              <span className="text-base font-mono font-bold text-emerald-400 mt-0.5">
                                ${(subRecipeDetails ? subRecipeDetails.costPerUnit : 0).toFixed(2)}/{activeSubRecipe.unit}
                              </span>
                              <span className="text-[8px] font-mono text-zinc-400 mt-0.5">
                                Static raw ingredient rate multiplier
                              </span>
                            </div>
                          </div>

                          {/* Sub-recipe Ingredients Table */}
                          <h4 className="text-[9.5px] font-mono font-bold text-zinc-500 uppercase tracking-widest mt-4 mb-1.5">
                            ITEMIZED RAW MATERIAL COMPONENTS
                          </h4>
                          <div className="overflow-x-auto border border-[#E6E6E6] rounded-xl shadow-xs bg-white">
                            <table className="w-full border-collapse text-left text-xs font-mono">
                              <thead className="bg-[#0F172A] border-b border-[#1E293B]">
                                <tr>
                                  <th className="p-3 text-[9px] text-slate-200 uppercase tracking-widest font-bold">COMP_NAME</th>
                                  <th className="p-3 text-[9px] text-slate-200 uppercase tracking-widest font-bold text-right">EDIBLE QTY (EP)</th>
                                  <th className="p-3 text-[9px] text-slate-200 uppercase tracking-widest font-bold text-center">YIELD %</th>
                                  <th className="p-3 text-[9px] text-slate-200 uppercase tracking-widest font-bold text-right">RAW AP REQUIRED</th>
                                  <th className="p-3 text-[9px] text-slate-200 uppercase tracking-widest font-bold text-right">COST WEIGHT</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-200 text-[10.5px]">
                                {subRecipeDetails?.detailedIngredients.map((ing, k) => {
                                  const localRawQty = calculateRawQuantity(ing.quantity * subRecipeScaler, ing.yieldPercent);
                                  return (
                                    <tr key={k} className="hover:bg-emerald-50/30 transition-colors border-b last:border-0 border-zinc-200">
                                      <td className="p-3 text-[#0F172A] font-bold">{ing.name}</td>
                                      <td className="p-3 text-right text-emerald-700 font-bold">{(ing.quantity * subRecipeScaler).toFixed(3)} {ing.unit}</td>
                                      <td className="p-3 text-center text-slate-500">{ing.yieldPercent}%</td>
                                      <td className="p-3 text-right text-slate-600">{localRawQty.toFixed(3)} {ing.unit}</td>
                                      <td className="p-3 text-right font-black text-[#0F172A]">${(localRawQty * ing.costPerUnit).toFixed(2)}</td>
                                    </tr>
                                  );
                                })}
                                {activeSubRecipe.ingredients.length === 0 && (
                                  <tr>
                                    <td colSpan={5} className="text-center py-4 text-slate-500 italic text-[11px]">
                                      No raw materials declared. Establishing simple base item rate.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>

                          {/* Sub-recipe Steps block */}
                          {activeSubRecipe.steps.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-zinc-805">
                              <h4 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                                PREP STEPS & METHOD
                              </h4>
                              <ol className="list-decimal list-inside text-[11.5px] font-mono text-zinc-300 space-y-1 pl-1">
                                {activeSubRecipe.steps.map((st, i) => (
                                  <li key={i} className="border-b border-zinc-850/20 pb-1 last:border-0 pl-1">
                                    <span className="text-zinc-100">{st}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}

                          {/* Trash button to delete sub-recipe */}
                          <div className="mt-5 pt-3 border-t border-zinc-800/65 flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setSubRecipes(prev => prev.filter(item => item.id !== activeSubRecipe.id));
                              }}
                              className="text-red-500 hover:text-red-400 hover:bg-red-950/20 px-3 py-1.5 rounded border border-transparent hover:border-red-900 font-mono text-[10px] flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Permanently Delete Prep
                            </button>
                          </div>

                        </div>
                      ) : (
                        <div className="text-center py-12 bg-zinc-900/40 border border-zinc-900 rounded-xl font-mono text-zinc-500 text-xs italic">
                          Please select or build a kitchen prep recipe to view costing matrix.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                  {/* SUB TAB 3: MASTER RECIPE BUILDER WORKSPACE */}
                  {recipeSubTab === 'builder' && (
                    <div id="recipe-builder-tab-content">
                      <RecipeSpecSheetBuilder
                        onRecipeSaved={(newRecData) => {
                          const newRec: Recipe = {
                            id: `r-custom-${Date.now()}`,
                            name: newRecData.name,
                            originalCovers: newRecData.originalCovers,
                            targetCovers: newRecData.originalCovers,
                            station: newRecData.station as PrepStation,
                            ingredients: newRecData.ingredients.map(ing => ({
                              name: ing.name,
                              quantity: ing.quantity,
                              unit: ing.unit,
                              costPerUnit: ing.costPerUnit,
                              purchaseUnit: ing.purchaseUnit,
                              yieldPercent: ing.yieldPercent
                            })),
                            steps: newRecData.steps,
                            salePrice: newRecData.salePrice,
                            timeMinutes: newRecData.timeMinutes,
                            status: newRecData.status,
                            menuSection: newRecData.menuSection,
                            targetFoodCostPercentage: newRecData.targetFoodCostPercentage,
                            tags: newRecData.tags,
                            allergens: newRecData.allergens
                          };
                          setRecipes(prev => [...prev, newRec]);
                          setSelectedRecipeId(newRec.id);
                          setCustomSalePrice(newRecData.salePrice);
                          setRecipeSubTab('costing');
                        }}
                        onCancel={() => {
                          setRecipeSubTab('costing');
                        }}
                      />
                    </div>
                  )}

              </div>
            )}

            {/* TAB 3: SERVER SIDE AI UNSTRUCTURED RECIPE TRANSCRIPTION */}
            {activeTab === 'ai-parser' && (
              <div id="ai-parser-tab-content" className="grid grid-cols-1 md:grid-cols-12 gap-5">
                
                {/* Unstructured input field */}
                <div className="md:col-span-6 bg-zinc-900/60 border border-zinc-900 rounded-xl p-4 flex flex-col gap-3 shadow-md">
                  <div>
                    <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-red-500 animate-pulse" /> AI TRANSCRIPTION ENGINE
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                      Paste messy smartphone notes, handovers, invoice texts, or plating brainstorms below.
                    </p>
                  </div>

                  <textarea
                    id="textarea-raw-recipe-input"
                    className="w-full h-80 bg-zinc-950 border border-zinc-850 rounded-lg p-3 text-xs font-mono text-white focus:outline-none focus:border-red-500 leading-relaxed placeholder-zinc-700"
                    placeholder="e.g. got chicken breasts 2kg sysco for $18, 90% yield..."
                    value={rawRecipeText}
                    onChange={(e) => setRawRecipeText(e.target.value)}
                  ></textarea>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-tight">
                      Vapor-fast Gemini 3.5 Flash Active
                    </span>

                    <button
                      id="btn-trigger-ai-parse"
                      onClick={handleRequestRecipeAIExtract}
                      disabled={apiLoading}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 text-white font-mono text-xs font-bold uppercase px-6 py-2.5 rounded-lg border border-red-500 hover:border-red-600 disabled:border-zinc-700 shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {apiLoading ? 'TRANSCRIBING...' : 'PARSE ME en PLACE'}
                    </button>
                  </div>

                  {apiError && (
                    <div className="bg-red-950/40 border border-red-900/60 text-red-400 p-3 rounded text-[11px] font-mono mt-2">
                      {apiError}
                    </div>
                  )}
                </div>

                {/* Live parsed preview & confirmation screen */}
                <div className="md:col-span-6 flex flex-col gap-4">
                  <div className="bg-zinc-900/60 border border-zinc-900 rounded-xl p-4 shadow-md h-full flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest border-b border-zinc-800/80 pb-2 mb-3">
                        PARSED OUTPUT INTERVIEW
                      </h4>

                      {parsedRecipeResult ? (
                        <div className="flex flex-col gap-3">
                          <div className="bg-red-950/15 border border-red-900/30 p-2.5 rounded text-[10px] text-red-400 font-mono leading-relaxed mb-2">
                            ✨ MiseOS Simulated AI Extraction Active. Review the details below then click Commit to add this to your catalog.
                          </div>

                          <div>
                            <span className="text-[9px] font-mono bg-zinc-800 border border-zinc-700 px-1.5 py-0.2 rounded text-zinc-300 uppercase">
                              {parsedRecipeResult.station}
                            </span>
                            <h4 className="text-sm font-mono font-bold text-white mt-1">
                              {parsedRecipeResult.name}
                            </h4>
                            <span className="text-[10px] font-mono text-zinc-400 mt-0.5">
                              Batch Covers: {parsedRecipeResult.originalCovers}
                            </span>
                          </div>

                          {/* Ingredient extracts table */}
                          <div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">
                              INGREDIENTS
                            </span>
                            <div className="max-h-36 overflow-y-auto border border-[#E6E6E6] rounded-xl shadow-xs bg-white">
                              <table className="w-full text-left text-[11px] font-mono border-collapse">
                                <thead className="bg-[#0F172A] sticky top-0 border-b border-[#1E293B]">
                                  <tr>
                                    <th className="p-2 text-[8px] text-slate-200 uppercase font-bold pl-3">Name</th>
                                    <th className="p-2 text-[8px] text-slate-200 uppercase font-bold text-right">Qty</th>
                                    <th className="p-2 text-[8px] text-slate-200 uppercase font-bold text-center">Trim Yield</th>
                                    <th className="p-2 text-[8px] text-slate-200 uppercase font-bold text-right pr-3">Cost</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 font-mono">
                                  {parsedRecipeResult.ingredients.map((ing, i) => (
                                    <tr key={i} className="hover:bg-emerald-50/30 transition-colors border-b last:border-0 border-zinc-200">
                                      <td className="p-2 pl-3 text-[#0F172A] font-bold truncate max-w-[120px]">{ing.name}</td>
                                      <td className="p-2 text-right text-emerald-700 font-extrabold">{ing.quantity} {ing.unit}</td>
                                      <td className="p-2 text-center text-slate-500">{ing.yieldPercent}%</td>
                                      <td className="p-2 text-right text-[#0F172A] font-medium pr-3">${ing.costPerUnit.toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Steps preview */}
                          <div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">
                              INSTRUCTION PROCESS
                            </span>
                            <div className="max-h-24 overflow-y-auto bg-zinc-950/50 p-2 rounded border border-zinc-850">
                              <ol className="list-decimal list-inside text-[11px] font-mono text-zinc-350 space-y-1">
                                {parsedRecipeResult.steps.map((st, i) => (
                                  <li key={i} className="truncate">{st}</li>
                                ))}
                              </ol>
                            </div>
                          </div>

                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                          <HelpCircle className="w-10 h-10 text-zinc-600 mb-2" />
                          <p className="text-xs text-zinc-500 font-mono">
                            No active extract preview loaded. Enter raw recipes, and hit Parse.
                          </p>
                        </div>
                      )}
                    </div>

                    {parsedRecipeResult && (
                      <div className="pt-3 border-t border-zinc-800/80 flex justify-end">
                        <button
                          id="btn-commit-ai-recipe"
                          onClick={handleAppendParsedRecipe}
                          className="bg-red-500 hover:bg-red-600 text-white font-mono text-xs font-bold uppercase px-6 py-2 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-4 h-4" /> Commit To Prep Catalog
                        </button>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: THE PASS, DIRECTORY HANDOVER LOGS & 86 DISHES */}
            {activeTab === 'wire' && (
              <div id="the-pass-tab-content" className="grid grid-cols-1 md:grid-cols-12 gap-5">
                
                {/* 86 List Component */}
                <div className="md:col-span-5 bg-zinc-900/60 border border-zinc-900 rounded-xl p-4 shadow-md flex flex-col gap-4">
                  <div>
                    <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500" /> ACTIVE 86'D INDEX
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                      Items marked out or severely limited for active dining room service
                    </p>
                  </div>

                  {/* 86 List Items */}
                  <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                    {items86.map((item) => (
                      <div
                        id={`86-item-node-${item.id}`}
                        key={item.id}
                        className="bg-zinc-950 border border-zinc-850 p-3 rounded-lg flex justify-between items-start gap-3"
                      >
                        <div>
                          <span className={`text-[8px] font-mono tracking-widest font-extrabold uppercase px-1 py-0.2 rounded ${
                            item.status === 'out'
                              ? 'bg-red-950 text-red-500 border border-red-900'
                              : 'bg-amber-950 text-amber-500'
                          }`}>
                            {item.status.toUpperCase()}
                          </span>
                          <h4 className="text-xs font-mono font-bold text-zinc-200 uppercase mt-1">
                            {item.name}
                          </h4>
                          {item.substitute && (
                            <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                              Sub modifier: <span className="text-emerald-500 font-semibold">{item.substitute}</span>
                            </p>
                          )}
                          <span className="text-[8px] font-mono text-zinc-500 block mt-1">
                            Log trace: {item.timestamp}
                          </span>
                        </div>

                        <button
                          id={`86-delete-${item.id}`}
                          onClick={() => handleDelete86(item.id)}
                          className="text-zinc-500 hover:text-red-500 p-1 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    {items86.length === 0 && (
                      <div className="text-center py-6 text-xs text-zinc-500 font-mono italic">
                        No active 86'd items. Kitchen is fully stocked.
                      </div>
                    )}
                  </div>

                  {/* Add 86 Item Form */}
                  <form onSubmit={handleAdd86} className="bg-zinc-950 border border-zinc-850 p-3 rounded-lg flex flex-col gap-2.5">
                    <h5 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                      + DECLARE 86 DISH
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-mono text-zinc-500">ITEM NAME</label>
                        <input
                          id="input-86-name"
                          type="text"
                          placeholder="e.g. Ribeye bone"
                          value={new86Name}
                          onChange={(e) => setNew86Name(e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1 rounded font-mono text-white focus:outline-none"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-mono text-zinc-500">STATUS</label>
                        <select
                          id="select-86-status"
                          value={new86Status}
                          onChange={(e) => setNew86Status(e.target.value as 'out' | 'limited')}
                          className="bg-zinc-900 border border-zinc-805 text-xs px-1.5 py-1 rounded font-mono text-white focus:outline-none"
                        >
                          <option value="out">86'D (OUT)</option>
                          <option value="limited">RUNNING LOW</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-mono text-zinc-500">SUGGESTED SUBSTITUTION ALTERNATIVE</label>
                      <input
                        id="input-86-substitute"
                        type="text"
                        placeholder="e.g. pan halibut, tenderloin steak"
                        value={new86Substitute}
                        onChange={(e) => setNew86Substitute(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1 rounded font-mono text-white focus:outline-none"
                      />
                    </div>
                    <button
                      id="btn-add-86"
                      type="submit"
                      className="bg-amber-600 hover:bg-amber-700 text-white font-mono uppercase text-[10px] font-bold py-1.5 rounded transition-all cursor-pointer"
                    >
                      Commit 86 Constraint
                    </button>
                  </form>
                </div>

                {/* Handover Logs Component */}
                <div className="md:col-span-7 bg-zinc-900/60 border border-zinc-900 rounded-xl p-4 shadow-md flex flex-col gap-3">
                  <div>
                    <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-red-505 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-red-400" /> BOH CONVERGENCE SHIFT HANDOVERS
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                      Direct coordinating notes streamed across shift handovers for continuity
                    </p>
                  </div>

                  {/* Handovers List */}
                  <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {handovers
                      .filter((h) => currentStation === 'All' || h.station === currentStation || h.station === 'All')
                      .map((log) => {
                        const isCritical = log.severity === 'critical';
                        const isWarning = log.severity === 'warning';

                        return (
                          <div
                            id={`handover-row-item-${log.id}`}
                            key={log.id}
                            className={`p-3.5 rounded-lg border transition-all ${
                              log.resolved
                                ? 'bg-zinc-950/40 border-zinc-900 opacity-50'
                                : isCritical
                                ? 'bg-red-950/40 border-red-900/40 shadow-sm shadow-red-900/5'
                                : isWarning
                                ? 'bg-amber-950/40 border-amber-900/40'
                                : 'bg-zinc-950 border-zinc-850'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-[8px] font-mono tracking-widest font-extrabold uppercase px-1.5 py-0.2 rounded ${
                                    isCritical
                                      ? 'bg-red-600 text-white'
                                      : isWarning
                                      ? 'bg-amber-500 text-black'
                                      : 'bg-zinc-800 text-zinc-350'
                                  }`}>
                                    {log.severity.toUpperCase()}
                                  </span>
                                  <span className="text-[10px] font-mono font-bold text-zinc-350">
                                    {log.sender}
                                  </span>
                                  <span className="text-[9px] font-mono bg-zinc-900 border border-zinc-800 px-1 rounded text-zinc-400">
                                    Station: {log.station}
                                  </span>
                                </div>
                                <p className={`text-[11px] font-mono mt-1.5 leading-relaxed ${
                                  log.resolved ? 'line-through text-zinc-500' : 'text-zinc-200'
                                }`}>
                                  {log.message}
                                </p>
                                <span className="text-[9px] font-mono text-zinc-505 block mt-1">
                                  Logged: {log.timestamp}
                                </span>
                              </div>

                              <div className="flex gap-2 shrink-0">
                                {/* Resolve toggle check */}
                                <button
                                  id={`handover-resolve-checkbox-${log.id}`}
                                  onClick={() => handleToggleHandoverResolve(log.id)}
                                  className={`px-2 py-0.5 border rounded text-[10px] font-mono transition-all cursor-pointer ${
                                    log.resolved
                                      ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400 font-bold'
                                      : 'border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
                                  }`}
                                >
                                  {log.resolved ? 'Resolved✓' : 'Resolve'}
                                </button>
                                <button
                                  id={`handover-delete-${log.id}`}
                                  onClick={() => handleDeleteHandover(log.id)}
                                  className="text-zinc-650 hover:text-red-400 p-0.5 rounded cursor-pointer animate-fade"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                    {handovers.filter((h) => currentStation === 'All' || h.station === currentStation || h.station === 'All').length === 0 && (
                      <div className="text-center py-6 text-xs text-zinc-500 font-mono italic">
                        No handover logs logged.
                      </div>
                    )}
                  </div>

                  {/* Add Handover form */}
                  <form onSubmit={handleAddHandover} className="bg-zinc-950 border border-zinc-850 p-3 rounded-lg flex flex-col gap-2.5">
                    <h5 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                      + LOG SHIFT PASS NOTE
                    </h5>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-mono text-zinc-500">YOUR TITLE</label>
                        <input
                          id="input-log-sender"
                          type="text"
                          placeholder="e.g. Sous Chef David"
                          value={newLogSender}
                          onChange={(e) => setNewLogSender(e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 text-xs px-2 py-1 rounded font-mono text-white focus:outline-none"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-mono text-zinc-500">STATION</label>
                        <select
                          id="select-log-station"
                          value={newLogStation}
                          onChange={(e) => setNewLogStation(e.target.value as PrepStation | 'All')}
                          className="bg-zinc-900 border border-zinc-805 text-xs px-1.5 py-1 rounded font-mono text-white focus:outline-none"
                        >
                          <option value="All">All stations</option>
                          <option value="Sauté">Sauté</option>
                          <option value="Grill">Grill</option>
                          <option value="Garde Manger">Garde Manger</option>
                          <option value="Pastry">Pastry</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-mono text-zinc-500">SEVERITY</label>
                        <select
                          id="select-log-severity"
                          value={newLogSeverity}
                          onChange={(e) => setNewLogSeverity(e.target.value as 'info' | 'warning' | 'critical')}
                          className="bg-zinc-900 border border-zinc-805 text-xs px-1.5 py-1 rounded font-mono text-white focus:outline-none"
                        >
                          <option value="info">Info note</option>
                          <option value="warning">Warning alert</option>
                          <option value="critical">Critical hazard</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-mono text-zinc-500">MESSAGE DETAIL</label>
                      <input
                        id="input-log-msg"
                        type="text"
                        placeholder="e.g. Range top 3 burner valve is loose..."
                        value={newLogMsg}
                        onChange={(e) => setNewLogMsg(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded font-mono text-white focus:outline-none"
                        required
                      />
                    </div>
                    <button
                      id="btn-add-handover"
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white font-mono uppercase text-[10px] font-bold py-1.5 rounded border border-red-500 transition-all cursor-pointer"
                    >
                      Commit Handover Message
                    </button>
                  </form>
                </div>

              </div>
            )}

            {/* TAB 5: BRAND CENTER - WHITE-LABELING CUSTOMIZER */}
            {activeTab === 'branding' && (
              <div id="brand-center-tab-content" className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
                
                {/* Brand properties Form */}
                <div className="md:col-span-7 bg-zinc-900/60 border border-zinc-900 rounded-xl p-5 shadow-md flex flex-col gap-4">
                  <div>
                    <h3 className="text-base font-mono font-bold uppercase text-red-500 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-red-500" /> Proprietary Brand Core
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono mt-1">
                      Configure custom white-label parameters. All properties propagate in real-time across headers, metrics, and print layers.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Brands/Establishment Name</label>
                      <input
                        id="brand-input-name"
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        className="bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                        placeholder="e.g. MiseOS"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Facility/Pass Code</label>
                      <input
                        id="brand-input-facility"
                        type="text"
                        value={facilityCode}
                        onChange={(e) => setFacilityCode(e.target.value)}
                        className="bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                        placeholder="e.g. THE PASS"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">System Subtitle / Philosophy</label>
                    <input
                      id="brand-input-subtitle"
                      type="text"
                      value={subTitle}
                      onChange={(e) => setSubTitle(e.target.value)}
                      className="bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                      placeholder="e.g. BOH Kitchen Operating Console"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Executive Chef On Duty</label>
                    <input
                      id="brand-input-chef"
                      type="text"
                      value={chefOnDuty}
                      onChange={(e) => setChefOnDuty(e.target.value)}
                      className="bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                      placeholder="e.g. Chef de Cuisine"
                    />
                  </div>

                  {/* Themes/Accents presets */}
                  <div className="border-t border-zinc-800/80 pt-4 mt-2">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-2.5">
                      Visual Brand Color Swatches (Focus Accent)
                    </span>
                    
                    <div className="flex flex-wrap gap-2.5">
                      {[
                        { name: 'Copper (Authentic)', color: '#C47E5A' },
                        { name: 'Cobalt (Deep)', color: '#2563EB' },
                        { name: 'Sage (Michelin)', color: '#527E5C' },
                        { name: 'Ocean (Teal)', color: '#3F8E96' },
                        { name: 'Obsidian (Nordic)', color: '#1F2937' },
                        { name: 'Apricot (Patisserie)', color: '#EA580C' }
                      ].map((preset) => (
                        <button
                          key={preset.color}
                          id={`swatch-${preset.name.toLowerCase().replace(/\s+/g, '-')}`}
                          type="button"
                          onClick={() => setThemeAccent(preset.color)}
                          className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                            themeAccent.toLowerCase() === preset.color.toLowerCase()
                              ? 'bg-zinc-950 text-white border-red-500 shadow-sm'
                              : 'bg-zinc-900 border-zinc-850 text-zinc-450 hover:text-zinc-200 hover:bg-zinc-950/40'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-zinc-950"
                            style={{ backgroundColor: preset.color }}
                          ></span>
                          {preset.name}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 mt-4 bg-zinc-950/40 border border-zinc-850 p-3 rounded-lg">
                      <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Or Custom Hex Code:</span>
                      <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-md border border-zinc-850">
                        <input
                          type="color"
                          value={themeAccent}
                          onChange={(e) => setThemeAccent(e.target.value)}
                          className="w-5 h-5 bg-transparent border-0 cursor-pointer rounded overflow-hidden"
                          title="Choose custom color"
                        />
                        <input
                          id="brand-input-color-hex"
                          type="text"
                          value={themeAccent}
                          onChange={(e) => setThemeAccent(e.target.value)}
                          className="w-20 bg-transparent text-white text-[10px] font-mono outline-none uppercase font-bold"
                          placeholder="#C47E5A"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Brand Preview panel mockup screen */}
                <div className="md:col-span-5 flex flex-col gap-4">
                  <div className="bg-zinc-900/60 border border-zinc-900 rounded-xl p-5 shadow-md flex flex-col gap-4">
                    <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest border-b border-zinc-800/80 pb-2">
                      Live White-Label Preview
                    </h4>

                    <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl flex flex-col gap-3 font-mono text-[11px] relative overflow-hidden select-none">
                      <div className="pb-2 border-b border-zinc-900 flex justify-between items-start">
                        <div>
                          <span className="text-[8px] bg-red-650 text-white font-bold px-1 py-0.2 rounded uppercase">
                            {facilityCode}
                          </span>
                          <h5 className="font-black text-xs text-white uppercase mt-1 tracking-tight">
                            {brandName}
                          </h5>
                          <span className="text-[8px] text-zinc-500 block uppercase">
                            {subTitle}
                          </span>
                        </div>
                        <span className="text-[8px] text-zinc-400 text-right bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-850">
                          SPEC #4010a
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 bg-zinc-900/50 p-2.5 rounded border border-zinc-900">
                        <div className="flex justify-between font-bold text-zinc-200">
                          <span>Ingredients</span>
                          <span>Trim Loss</span>
                        </div>
                        <div className="h-px bg-zinc-850 my-1"></div>
                        <div className="flex justify-between text-zinc-400 text-[10px]">
                          <span>Valrhona Chocolate 70%</span>
                          <span>0.0% EP</span>
                        </div>
                        <div className="flex justify-between text-zinc-400 text-[10px]">
                          <span>Cultured Irish Butter</span>
                          <span>0.5% EP</span>
                        </div>
                      </div>

                      <div className="pt-1.5 flex justify-between items-center text-[9px] text-zinc-500">
                        <span>On Duty: {chefOnDuty}</span>
                        <span className="text-red-500 font-bold uppercase">MiseOS Certified</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-zinc-500 font-mono leading-relaxed bg-zinc-950/40 p-3 rounded-lg border border-zinc-900 italic">
                      "System-wide white label custom styling is applied instantly across all view ports, menu item specs sheets, and reporting interfaces. Ready for proprietary kitchen deployment."
                    </div>
                  </div>
                </div>

              </div>
            )}

          </ErrorBoundary>

        </section>

      </main>

      {/* Floating alert bar if any line timer alarm status is active */}
      {currentAlarmsCount > 0 && (
        <div id="persistent-alarm-strip" className="fixed bottom-0 left-0 right-0 bg-red-600 text-white py-3.5 px-6 flex justify-between items-center z-50 animate-bounce shadow-2xl border-t border-red-500">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 animate-spin text-white" />
            <div>
              <p className="text-sm font-mono font-bold tracking-wider uppercase">
                CRITICAL WARNING: {currentAlarmsCount} ACTIVE LINE TIMER ALARM{currentAlarmsCount > 1 ? 'S' : ''}!
              </p>
              <p className="text-xs font-mono text-red-150 leading-none mt-1">
                A checking station timer reached completion limits. Sound buzzer activated.
              </p>
            </div>
          </div>
          <button
            id="clear-all-alarms"
            onClick={() => {
              setTimers((prev) =>
                prev.map((t) => (t.status === 'alarm' ? { ...t, status: 'idle', elapsedMs: 0 } : t))
              );
            }}
            className="bg-white text-red-700 font-mono font-extrabold uppercase text-xs px-5 py-2 rounded-lg leading-none border border-white hover:bg-zinc-100 transition-all cursor-pointer shadow-md"
          >
            Silencen Alarms
          </button>
        </div>
      )}

    </div>
  );
}
