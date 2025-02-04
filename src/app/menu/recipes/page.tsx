"use client";

import DataGrid, { Column, Editing } from "devextreme-react/data-grid";
import { Button } from "devextreme-react/button";
import { Popup } from "devextreme-react/popup";
import { SpeedDialAction } from "devextreme-react/speed-dial-action";
import DefaultLayout from "@/src/components/Layouts/DefaultLayout";
import { store } from "@/src/stores/recipeStore";
import { ingredientStore } from "@/src/stores/ingredientStore";
import { useCallback, useRef, useState } from "react";
import { Recipe, IngredientQuantity } from "@/src/types/recipe";
import client from "@/src/schema/client";
import {
  GET_RECIPES,
  UPDATE_INGREDIENTS_BY_RECIPE,
} from "@/src/queries/recipeQueries";

const Recipes = () => {
  const [editRecipe, setEditRecipe] = useState<Recipe | any>(null);
  const dataGrid = useRef<DataGrid>(null);
  const ingredientsRef = useRef<DataGrid>(null);
  const popupRef = useRef<Popup>(null);

  const showPopup = () => popupRef.current?.instance.show();

  const addRow = useCallback(() => {
    dataGrid.current?.instance.addRow();
  }, [dataGrid]);

  const renderButton = (e: { data: Recipe }) => {
    return (
      <Button
        className="my-2"
        text="Xem nguyên liệu"
        onClick={() => {
          setEditRecipe(e.data);
          const ingredients = e.data.ingredients;
          ingredientsRef.current?.instance.option(
            "dataSource",
            ingredients || []
          );
          showPopup();
        }}
      />
    );
  };

  const insertRecipe = (e: any) => {
    const ingredientsData = ingredientsRef.current?.instance
      .getDataSource()
      .items();
    const newRecipe = e.data;
    newRecipe.ingredients = ingredientsData;
  };

  const updateIngredientsByRecipe = async (id: any, recipe: Recipe) => {
    await client
      .mutate({
        mutation: UPDATE_INGREDIENTS_BY_RECIPE,
        variables: { id: id, ingredients: recipe.ingredients },
        refetchQueries: [{ query: GET_RECIPES }],
        onQueryUpdated: (observableQuery) => {
          return observableQuery.refetch();
        },
      })
      .then((res) => res.data.updateIngredientsByRecipe)
      .catch((err) => console.log(err));
  };

  const ingredientsGrid = (cellInfo: any) => {
    if (cellInfo.row.isNewRow) {
      return (
        <DataGrid
          ref={ingredientsRef}
          dataSource={[]}
          key="id"
          showBorders={true}
        >
          <Column
            dataField="id"
            caption="Tên nguyên liệu"
            editorOptions={{
              placeholder: "Chọn nguyên liệu",
            }}
            lookup={{
              dataSource: ingredientStore,
              displayExpr: "name",
              valueExpr: "id",
            }}
          />
          <Column dataField="quantity" caption="Số lượng" dataType="number" />
          <Editing allowAdding allowDeleting allowUpdating mode="batch" />
        </DataGrid>
      );
    }
  };

  return (
    <DefaultLayout>
      <DataGrid
        dataSource={store}
        showBorders={true}
        height={"auto"}
        ref={dataGrid}
        noDataText="Chưa có dữ liệu"
        onRowInserting={insertRecipe}
      >
        <Column
          dataField="STT"
          caption="STT"
          width={100}
          cellRender={(cellData) => cellData.rowIndex + 1}
        />
        <Column dataField={"name"} caption="Tên món" />
        <Column dataField={"description"} caption="Mô tả" />
        <Column
          dataField="ingredients"
          caption="Nguyên liệu"
          cellRender={renderButton}
          editCellRender={ingredientsGrid}
        />
        <Editing
          allowAdding={true}
          allowUpdating={true}
          allowDeleting={true}
          mode="popup"
          useIcons={true}
          popup={{
            width: 800,
            height: 500,
            showTitle: true,
            title: "Công thức",
          }}
          form={{
            items: [{ dataField: "name" }, { dataField: "description" }],
          }}
        ></Editing>
        <SpeedDialAction icon="add" label="Thêm mới" onClick={addRow} />
      </DataGrid>

      <Popup
        ref={popupRef}
        title="Nguyên liệu"
        width={600}
        height={400}
        showCloseButton={true}
      >
        <DataGrid
          ref={ingredientsRef}
          keyExpr="id"
          showBorders={true}
          onSaving={async (e) => {
            if (e.changes.length > 0) {
              const newDatas = [] as IngredientQuantity[];
              const ingredients = ingredientsRef.current?.instance
                .getDataSource()
                .items() as IngredientQuantity[] | any;
              e.changes.forEach((change) => {
                if (change.type === "update") {
                  const index = ingredients.findIndex(
                    (item: IngredientQuantity) => item.id === change.key
                  );
                  if (index !== -1) {
                    const { __typename, name, ...updateIngredient } =
                      ingredients[index];
                    ingredients[index] = {
                      ...updateIngredient,
                      quantity: change.data.quantity,
                    };
                  }
                } 
                else if (change.type === "insert") {
                  newDatas.push(change.data);
                }
              });

              const mergeData = [...ingredients, ...newDatas];
              console.log(mergeData)

              ingredientsRef.current?.instance.option("dataSource", [
                ...ingredients,
                ...newDatas,
              ]);
            }

            const newIngredients = ingredientsRef.current?.instance
              .getDataSource()
              .items() as IngredientQuantity[];

            newIngredients.forEach((item : any, index) => {
              const {__typename, name, ...newItem} = item;
              newIngredients[index] = newItem;
            })

            console.log(newIngredients)

            const { __typename, ...filterRecipe } = editRecipe;
            const updatedRecipe = {
              ...filterRecipe,
              ingredients: [...newIngredients],
            };
            await updateIngredientsByRecipe(updatedRecipe.id, updatedRecipe);
          }}
        >
          <Column
            dataField="id"
            caption="Tên nguyên liệu"
            editorOptions={{
              placeholder: "Chọn nguyên liệu",
            }}
            lookup={{
              dataSource: ingredientStore,
              displayExpr: "name",
              valueExpr: "id",
            }}
            validationRules={[
              { type: "required", message: "Chọn nguyên liệu" },
            ]}
          />
          <Column
            dataField="quantity"
            caption="Số lượng"
            dataType="number"
            validationRules={[{ type: "required", message: "Chọn số lượng" }]}
          />
          <Editing mode="batch" allowAdding allowDeleting allowUpdating />
        </DataGrid>
      </Popup>
    </DefaultLayout>
  );
};

export default Recipes;
