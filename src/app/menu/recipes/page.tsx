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

const Recipes = () => {
  const [selectedData, setSelectedData] = useState<IngredientQuantity[]>([]);

  const dataGrid = useRef<DataGrid>(null);
  const ingredientsRef = useRef<DataGrid>(null);
  const popupRef = useRef<Popup>(null);

  const showPopup = () => popupRef.current?.instance.show();

  const addRow = useCallback(() => {
    dataGrid.current?.instance.addRow();
  }, [dataGrid]);

  const renderButton = (e: { data: Recipe }) => {
    const ingredients = e.data.ingredients;
    return (
      <Button
        className="my-2"
        text="Xem nguyên liệu"
        onClick={() => {
          setSelectedData(ingredients);
          showPopup();
        }}
      />
    );
  };

  const updateRecipe = (e: any) => {
    const ingredientsData = ingredientsRef.current?.instance
      .getDataSource()
      .items();
    const newRecipe = e.newData;
    console.log(newRecipe);
    newRecipe.ingredients = ingredientsData;
  };

  const insertRecipe = (e: any) => {
    const ingredientsData = ingredientsRef.current?.instance
      .getDataSource()
      .items();
    const newRecipe = e.data;
    newRecipe.ingredients = ingredientsData;
  };

  const ingredientsGrid = (cellInfo: any) => {
    let ingredientList = cellInfo.data.ingredients;
    if (cellInfo.row.isNewRow) {
      return (
        <DataGrid
          ref={ingredientsRef}
          dataSource={[]}
          keyExpr="id"
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

    return (
      <DataGrid
        ref={ingredientsRef}
        dataSource={ingredientList}
        keyExpr="id"
        showBorders={true}
        onRowInserting={(e) => {
          console.log(e)
        }}
        onRowUpdating={(e) => {
          const ingredients = cellInfo.data.ingredients.map((ingredient: IngredientQuantity) => 
            ingredient.id === e.key 
              ? { ...ingredient, quantity: e.newData.quantity } 
              : ingredient
          ); 
          cellInfo.data.ingredients = {...ingredients};  
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
        />
        <Column dataField="quantity" caption="Số lượng" dataType="number" />
        <Editing allowAdding allowDeleting allowUpdating mode="batch" />
      </DataGrid>
    );
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
        onRowUpdating={updateRecipe}
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
            items: [
              { dataField: "name" },
              { dataField: "description" },
              { dataField: "ingredients", colSpan: 2 },
            ],
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
        <DataGrid dataSource={selectedData} keyExpr="name" showBorders={true}>
          <Column dataField="name" caption="Tên nguyên liệu" />
          <Column dataField="quantity" caption="Số lượng" dataType="number" />
        </DataGrid>
      </Popup>
    </DefaultLayout>
  );
};

export default Recipes;
