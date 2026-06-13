import { useState, useEffect, useRef, FormEvent } from 'react';
import {
  PrepItem,
  KitchenTimer,
  Recipe,
  HandoverLog,
  Item86,
  PrepStation,
  Ingredient,
  SubRecipe
} from '../types';
import {
  INITIAL_PREP_ITEMS,
  INITIAL_TIMERS,
  INITIAL_RECIPES,
  INITIAL_HANDOVERS,
  INITIAL_86_ITEMS,
  INITIAL_SUB_RECIPES
} from '../data';
import {
  calculateRawQuantity,
  calculateRecipeCostDetails
} from '../utils';

export function useKitchenState() {
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

  return {
    currentStation,
    setCurrentStation,
    prepItems,
    setPrepItems,
    timers,
    setTimers,
    recipes,
    setRecipes,
    handovers,
    setHandovers,
    items86,
    setItems86,
    activeTab,
    setActiveTab,
    recipeSubTab,
    setRecipeSubTab,
    brandName,
    setBrandName,
    subTitle,
    setSubTitle,
    themeAccent,
    setThemeAccent,
    facilityCode,
    setFacilityCode,
    chefOnDuty,
    setChefOnDuty,
    selectedRecipeId,
    setSelectedRecipeId,
    subRecipes,
    setSubRecipes,
    selectedSubRecipeId,
    setSelectedSubRecipeId,
    subRecipeScaler,
    setSubRecipeScaler,
    newPrepName,
    setNewPrepName,
    newPrepQty,
    setNewPrepQty,
    newPrepUnit,
    setNewPrepUnit,
    newPrepStation,
    setNewPrepStation,
    newPrepPriority,
    setNewPrepPriority,
    newPrepNotes,
    setNewPrepNotes,
    customSalePrice,
    setCustomSalePrice,
    newTimerLabel,
    setNewTimerLabel,
    newTimerMins,
    setNewTimerMins,
    newTimerStation,
    setNewTimerStation,
    newLogSender,
    setNewLogSender,
    newLogStation,
    setNewLogStation,
    newLogSeverity,
    setNewLogSeverity,
    newLogMsg,
    setNewLogMsg,
    new86Name,
    setNew86Name,
    new86Status,
    setNew86Status,
    new86Substitute,
    setNew86Substitute,

    // Sub-recipe Builder States
    subBuilderName,
    setSubBuilderName,
    subBuilderStation,
    setSubBuilderStation,
    subBuilderBatchSize,
    setSubBuilderBatchSize,
    subBuilderUnit,
    setSubBuilderUnit,
    subBuilderIngredients,
    setSubBuilderIngredients,
    subBuilderSteps,
    setSubBuilderSteps,
    subIngName,
    setSubIngName,
    subIngQty,
    setSubIngQty,
    subIngUnit,
    setSubIngUnit,
    subIngCost,
    setSubIngCost,
    subIngYield,
    setSubIngYield,
    subIngPurchaseUnit,
    setSubIngPurchaseUnit,
    subStepText,
    setSubStepText,

    // Parent Recipe Builder States
    builderName,
    setBuilderName,
    builderStation,
    setBuilderStation,
    builderOriginalCovers,
    setBuilderOriginalCovers,
    builderPrice,
    setBuilderPrice,
    builderIngredients,
    setBuilderIngredients,
    builderSteps,
    setBuilderSteps,
    builderTimeMinutes,
    setBuilderTimeMinutes,
    builderStatus,
    setBuilderStatus,
    builderMenuSection,
    setBuilderMenuSection,
    builderTargetFoodCostPercentage,
    setBuilderTargetFoodCostPercentage,
    builderTags,
    setBuilderTags,
    builderTagInput,
    setBuilderTagInput,
    builderAllergens,
    setBuilderAllergens,
    builderIngName,
    setBuilderIngName,
    builderIngQty,
    setBuilderIngQty,
    builderIngUnit,
    setBuilderIngUnit,
    builderIngCost,
    setBuilderIngCost,
    builderIngYield,
    setBuilderIngYield,
    builderIngPurchaseUnit,
    setBuilderIngPurchaseUnit,
    builderStepText,
    setBuilderStepText,
    builderError,
    setBuilderError,

    // AI states
    rawRecipeText,
    setRawRecipeText,
    apiLoading,
    setApiLoading,
    apiError,
    setApiError,
    parsedRecipeResult,
    setParsedRecipeResult,

    // Sound and helpers
    soundEnabled,
    setSoundEnabled,
    playAlertSound,
    currentPrepList,
    completedCount,
    currentAlarmsCount,
    activeRecipe,
    costCalculations,
    activeSubRecipe,
    subRecipeDetails,
    getSubRecipeCostDetails,
    filteredRecipesList,

    // Mutators
    handleTogglePrep,
    handleDeletePrep,
    handleAddPrep,
    handleStartTimer,
    handlePauseTimer,
    handleResetTimer,
    handleDeleteTimer,
    handleAddTimer,
    handleToggleHandoverResolve,
    handleAddHandover,
    handleDeleteHandover,
    handleAdd86,
    handleDelete86,
    handleRequestRecipeAIExtract,
    handleAppendParsedRecipe,
    handleScaleCovers,
    handleSetCoversDirectly,
  };
}
