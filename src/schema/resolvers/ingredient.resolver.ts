import { db } from "@/src/firebase/firebase";
import { Ingredient } from "@/src/types/ingredient";
import { RequestParams, Sort } from "@/src/types/requestParams";
import { ResponseResult } from "@/src/types/responseResult";
import cloudinary from "cloudinary";

const isValidName = async (ingredientName: string): Promise<boolean> => {
  const snapshot = await db
    .collection("ingredients")
    .where("name", "==", ingredientName)
    .get();
  return !snapshot.empty;
};

export const ingredientResolver = {
  Query: {
    ingredients: async (
      _: any,
      { requestParams }: { requestParams: RequestParams }
    ) => {
      let query : FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = await db.collection("ingredients");

      const sorts = requestParams.sort as Sort[];
      if (sorts?.length > 0) {
        sorts.forEach((condition) => {
          query = query.orderBy(
            condition.selector,
            condition.desc ? "desc" : "asc"
          );
        });
      }else{
        query = query.orderBy("createdDate","desc");
      }

      // if (requestParams.lastDocId) {
      //   const lastDoc = await db
      //     .collection("ingredients")
      //     .doc(requestParams.lastDocId)
      //     .get();
      //   if (lastDoc.exists) {
      //     query = query.startAfter(lastDoc);
      //   }
      // }

      query = query.offset(requestParams.skip).limit(requestParams.take);

      const snapshot = await query.get();

      const totalSnapshot = (await db.collection("ingredients").get()).size;
      return {
        data: {
          ...(snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
          })) as Ingredient[]),
          totalCount: totalSnapshot,
        },
      };
    },

    checkIngredientName: async (
      _: any,
      { name }: { name: string }
    ): Promise<ResponseResult<Ingredient>> => {
      const res = await isValidName(name);
      if (res) {
        return {
          success: false,
          status: 200,
        };
      }

      return {
        success: true,
        status: 400,
      };
    },
  },
  Mutation: {
    addIngredient: async (
      _: unknown,
      { ingredient }: { ingredient: Ingredient }
    ): Promise<ResponseResult<Ingredient | null>> => {
      try {
        ingredient.createdDate = new Date().toISOString();
        const isExisted = await isValidName(ingredient.name);
        if (isExisted) {
          return {
            success: false,
            status: 400,
            message: "Tên nguyên liệu đã có trên hệ thống.",
            data: null,
          };
        }

        const docRef = await db.collection("ingredients").add(ingredient);
        const snapshot = await docRef.get();
        return {
          status: 200,
          success: true,
          message: "Nguyên liệu đã được thêm vào hệ thống.",
          data: { id: snapshot.id, ...snapshot.data() } as Ingredient,
        };
      } catch (err) {
        return {
          status: 400,
          success: false,
          message: "Lỗi hệ thống.",
          data: null,
        };
      }
    },

    updateIngredient: async (
      _: unknown,
      { id, ingredient }: { id: string; ingredient: Ingredient }
    ): Promise<ResponseResult<Ingredient | null>> => {
      const ingredientRef = await db.collection("ingredients").doc(id);
      const docRef = await ingredientRef.get();
      if (!docRef.exists) {
        return {
          success: false,
          status: 400,
          data: null,
          message: "Nguyên liệu không tồn tại trong hệ thống",
        };
      }

      await ingredientRef.update({ ...docRef.data(), ...ingredient });
      const updatedDoc = await ingredientRef.get();
      return {
        success: true,
        status: 200,
        message: "Sửa thông tin thành công.",
        data: { id: updatedDoc.id, ...updatedDoc.data() } as Ingredient,
      };
    },

    removeIngredient: async (
      _: unknown,
      { id }: { id: string }
    ): Promise<ResponseResult<Ingredient | null>> => {
      const ingredientRef = await db.collection("ingredients").doc(id);
      const docRef = await ingredientRef.get();
      if (!docRef.exists) {
        return {
          success: false,
          status: 400,
          data: null,
          message: "Nguyên liệu không tồn tại trong hệ thống",
        };
      }

      const ingredient = { id: docRef.id, ...docRef.data() } as Ingredient;
      if (ingredient.imagePublicId) {
        try {
          await cloudinary.v2.uploader.destroy(ingredient.imagePublicId);
        } catch (error: any) {
          throw new Error(error.message);
        }
      }

      await ingredientRef.delete();
      return {
        success: true,
        status: 200,
        message: "Đã xóa nguyên liệu khỏi hệ thống",
        data: ingredient,
      };
    },
  },
};
