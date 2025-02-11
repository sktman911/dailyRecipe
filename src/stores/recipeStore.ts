import client from "@/src/schema/client";
import CustomStore from "devextreme/data/custom_store";
import {
  ADD_RECIPE,
  GET_RECIPES,
  REMOVE_RECIPE,
  UPDATE_RECIPE,
} from "../queries/recipeQueries";
import { Recipe } from "../types/recipe";
import Swal from "sweetalert2";

export const store = new CustomStore({
  key: "id",
  load: async () => {
    return await client
      .query({
        query: GET_RECIPES,
      })
      .then((res) => {
        return res.data.recipes;
      })
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  insert: async (values) => {
    try {
      const res = await client.mutate({
        mutation: ADD_RECIPE,
        variables: { recipe: values },
        refetchQueries: [{ query: GET_RECIPES }],
        onQueryUpdated: (observableQuery) => {
          return observableQuery.refetch();
        },
      });
      if (res.data.addRecipe.success === false) {
        Swal.fire({
          title: "Lỗi",
          text: res.data.addRecipe.message,
          icon: "error",
        });
      } else {
        Swal.fire({
          title: "Thành công",
          text: res.data.addRecipe.message,
          icon: "success",
        });
      }
      return res;
    } catch (error: any) {
      Swal.fire({
        title: "Lỗi",
        text: "Lỗi hệ thống. Vui lòng kiểm tra lại.",
        icon: "error",
      });
    }
  },
  update: async (key, values) => {
    const recipe = { id: key, ...values };
    try {
      const res = await client.mutate({
        mutation: UPDATE_RECIPE,
        variables: { id: key, recipe: recipe },
        refetchQueries: [{ query: GET_RECIPES }],
        onQueryUpdated: (observableQuery) => {
          return observableQuery.refetch();
        },
      });
      if (res.data.updateRecipe.success === false) {
        Swal.fire({
          title: "Lỗi",
          text: res.data.updateRecipe.message,
          icon: "error",
        });
      } else {
        Swal.fire({
          title: "Thành công",
          text: res.data.updateRecipe.message,
          icon: "success",
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Lỗi",
        text: "Lỗi hệ thống. Vui lòng kiểm tra lại.",
        icon: "error",
      });
    }
  },
  remove: async (key) => {
    try {
      const res = await client.mutate({
        mutation: REMOVE_RECIPE,
        variables: { id: key },
        refetchQueries: [{ query: GET_RECIPES }],
        onQueryUpdated: (observableQuery) => {
          return observableQuery.refetch();
        },
      });
      if (res.data.removeRecipe.success === false) {
        Swal.fire({
          title: "Lỗi",
          text: res.data.removeRecipe.message,
          icon: "error",
        });
      } else {
        Swal.fire({
          title: "Thành công",
          text: res.data.removeRecipe.message,
          icon: "success",
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Lỗi",
        text: "Lỗi hệ thống. Vui lòng kiểm tra lại.",
        icon: "error",
      });
    }
  },
});
