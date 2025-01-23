import { db } from "@/src/firebase/firebase";
import { Ingredient } from "@/src/types/ingredient";
import { IngredientQuantity, Recipe } from "@/src/types/recipe";

export const recipeResolver = {
  Query: {
    recipes: async (): Promise<Recipe[]> => {
      const snapshot = await db.collection("recipes").get();
      const recipes = snapshot.docs.map(async (doc) => {
        const recipeData = doc.data() as Recipe;

        // Ingredient id array
        const ingredientIds = recipeData.ingredients.map(
          (ingredient: IngredientQuantity) => ingredient.id
        ) as Array<string>;

        // DocumentReference array
        const ingredientRefs = ingredientIds.map((id: string) => db.collection("ingredients").doc(id));

        let ingredients: IngredientQuantity[] = [];
        if (ingredientRefs.length > 0) {
            const ingredientDocs = await db.getAll(...ingredientRefs);

          ingredients = ingredientDocs.map((ingredientDoc) => {
            const ingredientData = ingredientDoc.data() as Ingredient;
            return {
              id: ingredientDoc.id,
              name: ingredientData.name,
              quantity:
                recipeData.ingredients.find(
                  (i: any) => i.id === ingredientDoc.id
                )?.quantity || 0,
            } as IngredientQuantity;
          });
        }

        return {
          id: doc.id,
          name: recipeData.name,
          description: recipeData.description,
          createdDate: recipeData.createdDate,
          ingredients,
        } as Recipe;
      });
      return await Promise.all(recipes) as Recipe[];
    },
  },
  Mutation: {
    addRecipe: async (
      _: unknown,
      { recipe }: { recipe: Recipe }
    ): Promise<Recipe> => {
      recipe.createdDate = new Date().toISOString();
      const docRef = await db.collection("recipes").add(recipe);
      const snapshot = await docRef.get();
      return { id: snapshot.id, ...snapshot.data() } as Recipe;
    },
    updateRecipe: async (
      _: unknown,
      { id, recipe }: { id: string; recipe: Recipe }
    ): Promise<Recipe> => {
      const recipeRef = await db.collection("recipes").doc(id);
      const docRef = await recipeRef.get();
      if (!docRef.exists) {
        throw new Error("Recipe not found");
      }

      // const ingredientList = docRef.data()?.ingredients as IngredientQuantity[];
      // if (ingredientList.length > 0) {
      //   ingredientList.forEach((ingredient) => {
          
      //   })
      // }

      await recipeRef.update({ ...docRef.data(), ...recipe });
      const updatedDoc = await recipeRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() } as Recipe;
    },
    removeRecipe: async (
      _: unknown,
      { id }: { id: string }
    ): Promise<Recipe> => {
      const recipeRef = await db.collection("recipes").doc(id);
      const docRef = await recipeRef.get();
      const recipe = { id: docRef.id, ...docRef.data() } as Recipe;
      await recipeRef.delete();

      return recipe;
    },
  },
};
