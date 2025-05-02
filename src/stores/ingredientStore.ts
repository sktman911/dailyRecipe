import client from "@/src/schema/client";
import CustomStore from "devextreme/data/custom_store";
import {
  ADD_INGREDIENT,
  GET_INGREDIENTS,
  REMOVE_INGREDIENT,
  UPDATE_INGREDIENT,
} from "../queries/ingredientQueries";
import Swal from "sweetalert2";

export const ingredientStore = new CustomStore({
  key: "id",
  load: async () => {
    return await client
      .query({
        query: GET_INGREDIENTS,
      })
      .then((res) => {
        return res.data.ingredients;
      })
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  insert: async (values) => {
    try {
      const res = await client.mutate({
        mutation: ADD_INGREDIENT,
        variables: { ingredient: values },
        refetchQueries: [{ query: GET_INGREDIENTS }],
        onQueryUpdated: (observableQuery) => {
          return observableQuery.refetch();
        },
      });
      if (res.data.addIngredient.success === false) {
        Swal.fire({
          title: "Lỗi",
          text: res.data.addIngredient.message,
          icon: "error",
        });
      } else {
        Swal.fire({
          title: "Thành công",
          text: res.data.addIngredient.message,
          icon: "success",
        });
      }
      return res;
    } catch (error : any) {
      Swal.fire({
        title: "Lỗi",
        text: "Lỗi hệ thống. Vui lòng kiểm tra lại.",
        icon: "error",
      });
    }
  },
  update: async (key, values) => {
    const ingredient = { id: key, ...values };
    try{
      const res = await client
      .mutate({
        mutation: UPDATE_INGREDIENT,
        variables: { id: key, ingredient: ingredient },
        refetchQueries: [{ query: GET_INGREDIENTS }],
        onQueryUpdated: (observableQuery) => {
          return observableQuery.refetch();
        },
      });
      if (res.data.updateIngredient.success === false) {
        Swal.fire({
          title: "Lỗi",
          text: res.data.updateIngredient.message,
          icon: "error",
        });
      } else {
        Swal.fire({
          title: "Thành công",
          text: res.data.updateIngredient.message,
          icon: "success",
        });
      }
    }catch(err : any){
      Swal.fire({
        title: "Lỗi",
        text: "Lỗi hệ thống. Vui lòng kiểm tra lại.",
        icon: "error",
      });
    }
  },
  remove: async (key) => {
    try{
      const res = await client
      .mutate({
        mutation: REMOVE_INGREDIENT,
        variables: { id: key },
        refetchQueries: [{ query: GET_INGREDIENTS }],
        onQueryUpdated: (observableQuery) => {
          return observableQuery.refetch();
        },
      })
      if (res.data.removeIngredient.success === false) {
        Swal.fire({
          title: "Lỗi",
          text: res.data.removeIngredient.message,
          icon: "error",
        });
      } else {
        Swal.fire({
          title: "Thành công",
          text: res.data.removeIngredient.message,
          icon: "success",
        });
      }
    }
    catch(err){
      Swal.fire({
        title: "Lỗi",
        text: "Lỗi hệ thống. Vui lòng kiểm tra lại.",
        icon: "error",
      });
    }
  },
});
