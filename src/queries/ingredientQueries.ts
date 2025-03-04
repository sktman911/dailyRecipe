import { gql } from "@apollo/client";

export const GET_INGREDIENTS = gql`
  query GetIngredients($requestParams: RequestParams!) {
    ingredients(requestParams: $requestParams) {
      data
    }
  }
`;

export const GET_ALL_ACTIVE_INGREDIENTS = gql`
  query GetAllActiveIngredients{
    allIngredients{
      data
    }
  }
`;

export const ADD_INGREDIENT = gql`
  mutation AddIngredient($ingredient: IngredientPostDTO!) {
    addIngredient(ingredient: $ingredient) {
      success
      message
      status
      data
    }
  }
`;

export const REMOVE_INGREDIENT = gql`
  mutation RemoveIngredient($id: ID!) {
    removeIngredient(id: $id) {
      success
      message
      status
      data
    }
  }
`;

export const UPDATE_INGREDIENT = gql`
  mutation UpdateIngredient($id: ID!, $ingredient: IngredientPutDTO!) {
    updateIngredient(id: $id, ingredient: $ingredient) {
      success
      message
      status
      data
    }
  }
`;
