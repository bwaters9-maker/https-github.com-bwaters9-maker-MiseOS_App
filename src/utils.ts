/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Recipe, Ingredient, SubRecipe } from './types';

/**
 * Format a duration in milliseconds to MM:SS string.
 */
export function formatMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Calculate As Purchased (AP) quantity from Edible Portion (EP) quantity and yield percent.
 * Formula: AP = EP / (Yield% / 100)
 */
export function calculateRawQuantity(epQuantity: number, yieldPercent: number): number {
  const yieldFactor = yieldPercent / 100;
  if (yieldFactor <= 0) return epQuantity;
  return epQuantity / yieldFactor;
}

/**
 * Calculate standard wholesale purchasing unit cost of an ingredient.
 */
export function calculateIngredientCost(epQuantity: number, costPerUnit: number, yieldPercent: number): number {
  const apQuantity = calculateRawQuantity(epQuantity, yieldPercent);
  return apQuantity * costPerUnit;
}

/**
 * Recursively determine the cost per unit for a sub-recipe, factoring in nested sub-recipes.
 */
export function getSubRecipeCostPerUnit(sr: SubRecipe, subRecipes: SubRecipe[] = [], visited: string[] = []): number {
  if (visited.includes(sr.id)) return 0;
  const nextVisited = [...visited, sr.id];
  
  let totalCost = 0;
  sr.ingredients.forEach((ing) => {
    let costPerUnit = ing.costPerUnit;
    const nestedSub = subRecipes.find(s => s.name.trim().toLowerCase() === ing.name.trim().toLowerCase());
    if (nestedSub) {
      costPerUnit = getSubRecipeCostPerUnit(nestedSub, subRecipes, nextVisited);
    }
    const rawQtyNeeded = calculateRawQuantity(ing.quantity, ing.yieldPercent);
    totalCost += rawQtyNeeded * costPerUnit;
  });
  
  return sr.batchSize > 0 ? totalCost / sr.batchSize : 0;
}

interface RecipeCostDetails {
  totalCost: number;
  costPerPortion: number;
  foodCostPercentage: number;
  detailedIngredients: {
    name: string;
    scaledQuantity: number;
    unit: string;
    yieldPercent: number;
    rawQtyNeeded: number;
    costPerUnit: number;
    purchaseUnit: string;
    cost: number;
    isSubRecipe?: boolean;
  }[];
}

/**
 * Evaluate yield-adjusted AP & EP material costs dynamically based on covers scaling with sub-recipe nesting support.
 */
export function calculateRecipeCostDetails(recipe: Recipe, targetCovers: number, subRecipes: SubRecipe[] = []): RecipeCostDetails {
  const scale = targetCovers / (recipe.originalCovers || 1);
  
  let totalCost = 0;
  const detailedIngredients = recipe.ingredients.map((ing) => {
    const scaledEpQuantity = ing.quantity * scale;
    const scaledApQuantity = calculateRawQuantity(scaledEpQuantity, ing.yieldPercent);
    
    let isSubRecipe = false;
    let costPerUnit = ing.costPerUnit;
    let purchaseUnit = ing.purchaseUnit;
    
    const matchedSub = subRecipes.find(
      (sr) => sr.name.trim().toLowerCase() === ing.name.trim().toLowerCase()
    );
    
    if (matchedSub) {
      isSubRecipe = true;
      costPerUnit = getSubRecipeCostPerUnit(matchedSub, subRecipes);
      purchaseUnit = matchedSub.unit;
    }
    
    const cost = scaledApQuantity * costPerUnit;
    totalCost += cost;

    return {
      name: ing.name,
      scaledQuantity: scaledEpQuantity,
      unit: ing.unit,
      yieldPercent: ing.yieldPercent,
      rawQtyNeeded: scaledApQuantity,
      costPerUnit,
      purchaseUnit,
      cost,
      isSubRecipe
    };
  });

  const costPerPortion = targetCovers > 0 ? totalCost / targetCovers : 0;
  const salePrice = recipe.salePrice || 12; // default fallback sale price
  const foodCostPercentage = salePrice > 0 ? (costPerPortion / salePrice) * 100 : 0;

  return {
    totalCost,
    costPerPortion,
    foodCostPercentage,
    detailedIngredients
  };
}
