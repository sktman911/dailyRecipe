import {makeExecutableSchema} from "@graphql-tools/schema"
import { typeDefs } from "./schemas";
import { resolvers } from "./resolvers/index.resolver"

export const schema = makeExecutableSchema({typeDefs, resolvers})