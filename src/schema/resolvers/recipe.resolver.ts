import { db } from "@/src/firebase/firebase";
import { Ingredient } from "@/src/types/ingredient";
import { IngredientQuantity, Recipe } from "@/src/types/recipe";
import { ResponseResult } from "@/src/types/responseResult";

export const recipeResolver = {
  Query: {
    recipes: async (): Promise<Recipe[]> => {
      const snapshot = await db.collection("recipes").get();
      const recipes = snapshot.docs.map(async (doc) => {
        const recipeData = doc.data() as Recipe;

        if (recipeData.ingredients && recipeData.ingredients.length > 0) {
          // Ingredient id array
          const ingredientIds = recipeData.ingredients.map(
            (ingredient: IngredientQuantity) => ingredient.id
          ) as Array<string>;

          // DocumentReference array
          const ingredientRefs = ingredientIds.map((id: string) =>
            db.collection("ingredients").doc(id)
          );

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
            instruction: recipeData.instruction,
            ingredients,
          } as Recipe;
        } else {
          return {
            id: doc.id,
            name: recipeData.name,
            description: recipeData.description,
            createdDate: recipeData.createdDate,
            instruction: recipeData.instruction,
          } as Recipe;
        }
      });
      return (await Promise.all(recipes)) as Recipe[];
    },
  },
  Mutation: {
    addRecipe: async (
      _: unknown,
      { recipe }: { recipe: Recipe }
    ): Promise<ResponseResult<Recipe | null>> => {
      try{
        recipe.createdDate = new Date().toISOString();
      const docRef = await db.collection("recipes").add(recipe);
      const snapshot = await docRef.get();
      return {
        status: 200,
        success: true,
        message: "Công thức đã được thêm vào hệ thống.",
        data: { id: snapshot.id, name: snapshot.data()?.name } as Recipe,
      };
      }catch(err) {
        return {
          status: 400,
          success: false,
          message: "Lỗi hệ thống.",
          data: null,
        };
      }
    },
    updateRecipe: async (
      _: unknown,
      { id, recipe }: { id: string; recipe: Recipe }
    ): Promise<ResponseResult<Recipe | null>> => {
      const recipeRef = await db.collection("recipes").doc(id);
      const docRef = await recipeRef.get();
      if (!docRef.exists) {
        return {
          success: false,
          status: 400,
          data: null,
          message: "Công thức không tồn tại trong hệ thống",
        };
      }

      await recipeRef.update({ ...docRef.data(), ...recipe });
      const updatedDoc = await recipeRef.get();
      return {
        success: true,
        status: 200,
        message: "Sửa thông tin thành công.",
        data: { id: updatedDoc.id, name: updatedDoc.data()?.name} as Recipe,
      };
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
    handleIngredientsByRecipe: async (
      _: unknown,
      { id, ingredients }: { id: string; ingredients: IngredientQuantity[] }
    ) => {
      
      const recipeRef = await db.collection("recipes").doc(id);
      const docRef = await recipeRef.get();
      if (!docRef.exists) {
        throw new Error("Recipe not found");
      }

      const oldIngredients = docRef.data()?.ingredients;

      const ingredientMap = new Map(
        oldIngredients.map((item: any) => [item.id, item])
      );

      ingredients.forEach((newItem: any) => {
        if (ingredientMap.has(newItem.id)) {
          ingredientMap.set(newItem.id, { ...newItem ,quantity: newItem.quantity });
        } else {
          ingredientMap.set(newItem.id, newItem);
        }
      });

      // remove
      const updatedIngredients = Array.from(ingredientMap.values())
    .filter((item:any) => ingredients.some(newItem => newItem.id === item.id));

      await recipeRef.update({ ingredients: updatedIngredients });

      const updatedDoc = await recipeRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() } as Recipe;
    },
  },
};
