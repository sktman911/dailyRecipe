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
import { HtmlEditor } from "devextreme-react/html-editor";
import {
  GET_RECIPES,
  HANDLE_INGREDIENTS_BY_RECIPE,
} from "@/src/queries/recipeQueries";
import { SavingEvent } from "devextreme/ui/data_grid";

const Recipes = () => {
  const [editRecipe, setEditRecipe] = useState<Recipe | any>(null);
  const dataGrid = useRef<DataGrid>(null);
  const ingredientsRef = useRef<DataGrid>(null);
  const popupRef = useRef<Popup>(null);
  const instructionViewRef = useRef<Popup>(null);

  const showPopup = () => popupRef.current?.instance.show();

  const showInstructionView =  () => instructionViewRef.current?.instance.show();

  const addRow = useCallback(() => {
    dataGrid.current?.instance.addRow();
  }, [dataGrid]);

  // Render ingredients button
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

  const renderInstructionView = (e : any) => {
    return (
      <Button
        className="my-2"
        text="Xem hướng dẫn"
        onClick={() => {
          tranformTextToHtml(e.value)
          showInstructionView();
        }}
      />
    );
  }

  const tranformTextToHtml = (e : any) =>{
    
  }

  // Handle CRUD ingredients list
  const handleIngredientsByRecipe = async (id: any, recipe: Recipe) => {
    await client
      .mutate({
        mutation: HANDLE_INGREDIENTS_BY_RECIPE,
        variables: { id: id, ingredients: recipe.ingredients },
        refetchQueries: [{ query: GET_RECIPES }],
        onQueryUpdated: (observableQuery) => {
          return observableQuery.refetch();
        },
      })
      .then((res) => res.data.handleIngredientsByRecipe)
      .catch((err) => console.log(err));
  };

  const handleBeforeSendRequest = async (e: SavingEvent) => {
    if (e.changes.length > 0) {
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
        } else if (change.type === "insert") {
          ingredients.push(change.data);
        } else if (change.type === "remove") {
          const index = ingredients.findIndex(
            (item: any) => item.id === change.key
          );
          if (index !== -1) {
            ingredients.splice(index, 1);
          }
        }
      });

      ingredientsRef.current?.instance.option("dataSource", [...ingredients]);
    }

    const newIngredients = ingredientsRef.current?.instance
      .getDataSource()
      .items() as IngredientQuantity[];

    newIngredients.forEach((item: any, index) => {
      const { __typename, name, ...newItem } = item;
      newIngredients[index] = newItem;
    });

    const { __typename, ...filterRecipe } = editRecipe;
    const updatedRecipe = {
      ...filterRecipe,
      ingredients: newIngredients,
    };

    return updatedRecipe;
  };

  return (
    <DefaultLayout>
      <DataGrid
        dataSource={store}
        showBorders={true}
        height={"auto"}
        ref={dataGrid}
        noDataText="Chưa có dữ liệu"
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
          dataField={"instruction"}
          caption="Hướng dẫn làm"
          cellRender={renderInstructionView}
          editCellRender={(data) => (
            <HtmlEditor
              defaultValue={data.value}
              onValueChanged={(e) => {
                if (data.setValue) {
                  data.setValue(e.value);
                }               
              }}
              height={200}
              toolbar={{
                items: [
                  "bold",
                  "italic",
                  "underline",
                  "strike",
                  "alignLeft",
                  "alignCenter",
                  "alignRight",
                  "alignJustify",
                  "orderedList",
                  "bulletList",
                  "link",
                  "image",
                  "blockquote",
                ],
              }}
            />
          )}
        />
        <Column
          dataField="ingredients"
          caption="Nguyên liệu"
          cellRender={renderButton}
        />
        <Editing
          allowUpdating
          allowDeleting
          mode="popup"
          useIcons={true}
          popup={{
            width: 800,
            height: 500,
            showTitle: true,
            title: "Công thức",
          }}
          form={{
            items: [
              { dataField: "name" },
              { dataField: "description" },
              { dataField: "instruction", colSpan: 2 },
            ],
          }}
        ></Editing>
        <SpeedDialAction icon="add" label="Thêm mới" onClick={addRow} />
      </DataGrid>

      {/* Ingredients CRUD popup  */}
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
          onEditorPreparing={(e) => {
            if (e.dataField === "id" && e.parentType === "dataRow") {
              if (e.row?.isNewRow) {
                e.editorOptions.readOnly = false;
              } else {
                e.editorOptions.readOnly = true;
              }
            }
          }}
          onRowInserting={(e) => {
            e.cancel = true;
            ingredientsRef.current?.instance.cancelEditData();
          }}
          onSaving={async (e) => {
            const updatedRecipe = await handleBeforeSendRequest(e);
            await handleIngredientsByRecipe(updatedRecipe.id, updatedRecipe);
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

      {/* Instruction View Popup  */}
      <Popup
        ref={instructionViewRef}
        title="Hướng dẫn"
        width={600}
        height={400}
        showCloseButton={true}
        contentTemplate={(e) => {

        }}
      >
      </Popup>
    </DefaultLayout>
  );
};

export default Recipes;
