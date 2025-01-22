import client from "@/src/schema/client";
import CustomStore from "devextreme/data/custom_store";
import { ADD_RECIPE, GET_RECIPES, REMOVE_RECIPE, UPDATE_RECIPE } from "../queries/recipeQueries";
import { Recipe } from "../types/recipe";

export const store = new CustomStore({
  key: "id",
  load: async () => {
    return await client
      .query({
        query: GET_RECIPES,
      })
      .then((res) => {
        return res.data.recipes})
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  insert: (values) : Promise<Recipe> => {
    return client
      .mutate({
        mutation: ADD_RECIPE,
        variables: {recipe: values},
        refetchQueries: [{ query: GET_RECIPES }], 
        onQueryUpdated: (observableQuery) => {
          return observableQuery.refetch();
        },
      })
      .then((res) => res.data.addRecipe)
      .catch((err) => console.log(err));
  },
  update: (key, values) : Promise<Recipe> => {
    const recipe = {id: key,...values};
    return client.mutate({
      mutation: UPDATE_RECIPE,
      variables: {id:key, recipe: recipe},
      refetchQueries: [{ query: GET_RECIPES }], 
        onQueryUpdated: (observableQuery) => {
          return observableQuery.refetch();
        },
    })
    .then((res) => res.data.updateRecipe)
    .catch((err) => console.log(err));
  },
  remove: async (key) => {
    return await client
    .mutate({
      mutation: REMOVE_RECIPE,
      variables: {id: key},
      refetchQueries: [{ query: GET_RECIPES }], 
      onQueryUpdated: (observableQuery) => {
        return observableQuery.refetch();
      },
    })
    .then(res => {
      return res.data.removeRecipe
    })
    .catch(err => console.log(err))
  },
});
