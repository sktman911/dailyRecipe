import { gql } from '@apollo/client';

export const GET_RECIPES = gql`
  query GetRecipes {
    recipes {
      id
      name
      description
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
        id
        name
        description
        ingredients{         
          name
          quantity
        }
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
        id
        name
        description
    }
  }
`

export const UPDATE_INGREDIENTS_BY_RECIPE = gql`
  mutation UpdateIngredientsByRecipe($id:ID!, $ingredients: [IngredientInput!]){
    updateIngredientsByRecipe(id: $id, ingredients: $ingredients){
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



