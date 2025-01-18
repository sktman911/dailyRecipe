import { IngredientQuantity } from "./ingredient";

export interface Recipe {
    id: string;
    name: string;
    // createdBy: string;
    createdDate: string;
    description?: string;
    // category: number;
    ingredients: [IngredientQuantity];    
}



