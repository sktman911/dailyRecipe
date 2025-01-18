import { gql } from "@apollo/client";

export const GET_INGREDIENTS = gql`
  query GetIngredients {
    ingredients {
      id
      name
      description
      image
      imagePublicId
    }
  }
`;

export const CHECK_INGREDIENTNAME = gql`
  query CheckIngredientName($name : String) {
    checkIngredientName(name: $name) {
      success
      message
      status
    }
  }
`;

export const ADD_INGREDIENT = gql`
  mutation AddIngredient($ingredient: IngredientPostDTO!) {
    addIngredient(ingredient: $ingredient) {
      success
      message
      status
      data {
        id
        name
        description
        image
        imagePublicId
      }
    }
  }
`;

export const REMOVE_INGREDIENT = gql`
  mutation RemoveIngredient($id: ID!) {
    removeIngredient(id: $id) {
      success
      message
      status
      data {
        id
        name
      }
    }
  }
`;

export const UPDATE_INGREDIENT = gql`
  mutation UpdateIngredient($id: ID!, $ingredient: IngredientPutDTO!) {
    updateIngredient(id: $id, ingredient: $ingredient) {
      success
      message
      status
      data {
        id
        name
        description
        image
        imagePublicId
      }
    }
  }
`;
