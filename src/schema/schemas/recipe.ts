import { gql } from "@apollo/client";

export const Recipe = gql`
    type Recipe{
        id: ID!
        name: String!
        description: String
        createdDate: String
        createdBy: String
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

    input RecipePostDTO{
        name: String!
        description: String
        createdDate: String
        ingredients: [IngredientInput]
    }

    input RecipePutDTO{
        id: ID!
        name: String
        description: String
    }

    type Query{
        recipes: [Recipe!]!
    }

    type Mutation{
        addRecipe(recipe: RecipePostDTO!) : Recipe!
        updateRecipe(id: ID!, recipe: RecipePutDTO!) : Recipe!
        removeRecipe(id: ID!): Recipe!
        updateIngredientsByRecipe(id: ID!, ingredients: [IngredientInput!]) : Recipe!
    }
`;
