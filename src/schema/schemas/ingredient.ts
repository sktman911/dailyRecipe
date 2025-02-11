import { gql } from "@apollo/client";

export const Ingredient = gql`
  type ResponseResult {
    success: Boolean
    message: String
    status: Int
    data: JSON
  }
  scalar JSON

  input RequestParams {
    skip: Int
    take: Int
    sort: [Sort]
    filter: [Filter]
    lastDocId: String
  }

  input Sort {
    desc: Boolean
    selector: String
  }

  input Filter {
    field: String
    operator: String
    value: String
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

  input IngredientPostDTO {
    name: String
    image: String
    imagePublicId: String
    description: String
    createdDate: String
    createdBy: String
  }

  input IngredientPutDTO {
    id: ID!
    name: String
    description: String
    image: String
    imagePublicId: String
  }

  type Query {
    ingredients(requestParams: RequestParams) : ResponseResult!
    checkIngredientName(name: String): ResponseResult!
  }

  type Mutation {
    addIngredient(ingredient: IngredientPostDTO!): ResponseResult!
    updateIngredient(id: ID!, ingredient: IngredientPutDTO!): ResponseResult!
    removeIngredient(id: ID!): ResponseResult!
  }
`;
