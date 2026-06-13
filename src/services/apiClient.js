/**
 * src/services/apiClient.js
 * Centralized API gateway for MiseOS.
 */

export const apiClient = {
  // Fetch wrapper for standardized requests
  async request(endpoint, options = {}) {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }
    return response.json();
  },

  // Service Endpoints
  recipes: {
    getAll: () => apiClient.request('/recipes'),
    save: (recipeData) => apiClient.request('/recipes', { 
      method: 'POST', 
      body: JSON.stringify(recipeData) 
    }),
  },

  ingredients: {
    getAll: () => apiClient.request('/ingredients'),
  }
};