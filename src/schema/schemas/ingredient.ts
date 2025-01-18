import { gql } from "@apollo/client";

export const Ingredient = gql`
    type ResponseResult{
        success: Boolean
        message : String
        status: Int
        data: Ingredient
    }

    type Ingredient {
        id: ID!
        name: String!
        image: String
        imagePublicId: String
        description: String
        createdDate: String
        createdBy: String
    }

    input IngredientPostDTO{
        name: String
        image: String
        imagePublicId: String
        description: String
        createdDate: String
        createdBy: String
    }
    
    input IngredientPutDTO{
        id: ID!
        name: String
        description: String
        image: String
        imagePublicId: String
    }

    type Query{
        ingredients: [Ingredient!]!
        checkIngredientName(name: String) : ResponseResult!
    }

    type Mutation{
        addIngredient(ingredient: IngredientPostDTO!) : ResponseResult!
        updateIngredient(id: ID!, ingredient: IngredientPutDTO!) : ResponseResult!
        removeIngredient(id: ID!) : ResponseResult!
    }
`;
