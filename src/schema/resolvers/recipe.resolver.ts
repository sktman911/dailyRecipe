import { db } from "@/src/firebase/firebase"
import { Recipe } from "@/src/types/recipe";

export const recipeResolver = {
    Query:{
        recipes: async () : Promise<Recipe[]> => {
            const snapshot = await db.collection("recipes").get();
            return snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()})) as Recipe[];
        }
    },
    Mutation: {
        addRecipe: async (_:unknown, {recipe}: {recipe:Recipe}): Promise<Recipe> =>{
            recipe.createdDate = new Date().toISOString();


            const ingredientReferences = await Promise.all(
                recipe.ingredients.map(async (item) => {
                  const ingredientRef = db.collection("ingredients").doc(item.id);
                //   const ingredientDoc = await ingredientRef.get();
    
                  return {
                    ingredient: ingredientRef, 
                    quantity: item.quantity,  
                  };
                })
              );

            recipe.ingredients = ingredientReferences;
            const docRef = await db.collection("recipes").add(recipe);
            const snapshot = await docRef.get();
            return {id: snapshot.id, ...snapshot.data()} as Recipe;
        },
        updateRecipe: async (_:unknown, {id,recipe}:{id:string,recipe: Recipe}) : Promise<Recipe> => {
            const recipeRef = await db.collection("recipes").doc(id);
            const docRef = await recipeRef.get();
            if (!docRef.exists) {
                throw new Error('Recipe not found');
            }

            await recipeRef.update({...docRef.data(),...recipe});
            const updatedDoc = await recipeRef.get();
            return { id: updatedDoc.id, ...updatedDoc.data() } as Recipe;
        },
        removeRecipe: async (_:unknown, {id}: {id: string}) : Promise<Recipe> => {
            const recipeRef = await db.collection("recipes").doc(id);
            const docRef = await recipeRef.get();
            const recipe = {id: docRef.id, ...docRef.data()} as Recipe;
            await recipeRef.delete();
            
            return recipe;
        }
    }
    
}