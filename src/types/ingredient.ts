
export interface Ingredient {
    id: string;
    name: string;
    description: string;
    image: string;
    imagePublicId: string;
    createdDate: string;
    createdBy: string;
  }

export interface IngredientQuantity{
    id: string;
    quantity: number;
}