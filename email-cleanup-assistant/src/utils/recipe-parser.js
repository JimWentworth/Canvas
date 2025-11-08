/**
 * Recipe Parser and Validator
 * Handles YAML parsing and validation for site automation recipes
 */

const fs = require('fs').promises;
const path = require('path');
const YAML = require('yaml');

class RecipeParser {
  /**
   * Load and parse a recipe file
   * @param {string} recipePath - Path to the recipe YAML file
   * @returns {Object} Parsed recipe object
   */
  async loadRecipe(recipePath) {
    try {
      const content = await fs.readFile(recipePath, 'utf8');
      const recipe = YAML.parse(content);

      this.validateRecipe(recipe);
      return recipe;
    } catch (error) {
      throw new Error(`Failed to load recipe: ${error.message}`);
    }
  }

  /**
   * Load all recipes from a directory
   * @param {string} recipesDir - Directory containing recipe files
   * @returns {Array} Array of parsed recipes
   */
  async loadAllRecipes(recipesDir) {
    try {
      const files = await fs.readdir(recipesDir);
      const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));

      const recipes = await Promise.all(
        yamlFiles.map(file => this.loadRecipe(path.join(recipesDir, file)))
      );

      return recipes;
    } catch (error) {
      throw new Error(`Failed to load recipes: ${error.message}`);
    }
  }

  /**
   * Validate recipe structure
   * @param {Object} recipe - Recipe object to validate
   * @throws {Error} If recipe is invalid
   */
  validateRecipe(recipe) {
    const requiredFields = ['id', 'name', 'login'];

    for (const field of requiredFields) {
      if (!recipe[field]) {
        throw new Error(`Recipe missing required field: ${field}`);
      }
    }

    // Validate login section
    if (!recipe.login.url) {
      throw new Error('Recipe login section missing url');
    }

    // Validate profile flow if present
    if (recipe.profile_flow && !recipe.profile_flow.steps) {
      throw new Error('Recipe profile_flow missing steps array');
    }

    return true;
  }

  /**
   * Get recipe by site ID
   * @param {Array} recipes - Array of all recipes
   * @param {string} siteId - Site identifier
   * @returns {Object|null} Recipe object or null if not found
   */
  getRecipeBySiteId(recipes, siteId) {
    return recipes.find(r => r.id === siteId) || null;
  }

  /**
   * List all available sites
   * @param {Array} recipes - Array of all recipes
   * @returns {Array} Array of site objects with id and name
   */
  listAvailableSites(recipes) {
    return recipes.map(r => ({
      id: r.id,
      name: r.name,
      category: r.category || 'Other'
    }));
  }
}

module.exports = new RecipeParser();
