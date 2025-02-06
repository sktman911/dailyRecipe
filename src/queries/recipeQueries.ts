import { gql } from '@apollo/client';

export const GET_RECIPES = gql`
  query GetRecipes {
    recipes {
      id
      name
      description
      instruction
      ingredients{
        id
        name
        quantity
      }
    }
  }
`;

export const ADD_RECIPE = gql`
  mutation AddRecipe($recipe: RecipePostDTO!){
    addRecipe(recipe: $recipe){
      success
      message
      status
      data
    }
  }
`

export const REMOVE_RECIPE = gql`
  mutation RemoveRecipe($id: ID!){
    removeRecipe(id: $id){
        id
        name
    }
  }
`

export const UPDATE_RECIPE = gql`
  mutation UpdateRecipe($id:ID!,$recipe: RecipePutDTO!){
    updateRecipe(id: $id, recipe: $recipe){
      success
      message
      status
      data
    }
  }
`

export const HANDLE_INGREDIENTS_BY_RECIPE = gql`
  mutation HandleIngredientsByRecipe($id:ID!, $ingredients: [IngredientInput!]){
    handleIngredientsByRecipe(id: $id, ingredients: $ingredients){
        id
        name
        description
        ingredients{
          id
          quantity
        }
    }
  }
`



