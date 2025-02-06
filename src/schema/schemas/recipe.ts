import { gql } from "@apollo/client";

export const Recipe = gql`
  type ResponseResult {
    success: Boolean
    message: String
    status: Int
    data: JSON
  }

  scalar JSON

  type Recipe {
    id: ID!
    name: String!
    description: String
    createdDate: String
    createdBy: String
    instruction: String
    ingredients: [Ingredient]
  }

  type Ingredient {
    id: ID!
    name: String!
    quantity: Float!
  }

  input IngredientInput {
    id: ID!
    quantity: Float!
  }

  input RecipePostDTO {
    name: String!
    description: String
    createdDate: String
    instruction: String
    ingredients: [IngredientInput]
  }

  input RecipePutDTO {
    id: ID!
    name: String
    description: String
    instruction: String
  }

  type Query {
    recipes: [Recipe!]!
  }

  type Mutation {
    addRecipe(recipe: RecipePostDTO!): ResponseResult!
    updateRecipe(id: ID!, recipe: RecipePutDTO!): ResponseResult!
    removeRecipe(id: ID!): ResponseResult!
    handleIngredientsByRecipe(id: ID!, ingredients: [IngredientInput!]): Recipe!
  }
`;
