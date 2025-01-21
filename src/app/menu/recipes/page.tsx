"use client";

import DataGrid, { Column, Editing } from "devextreme-react/data-grid";
import { SelectBox } from "devextreme-react";
import { Button } from "devextreme-react/button";
import { Popup } from "devextreme-react/popup";
import { SpeedDialAction } from "devextreme-react/speed-dial-action";
import DefaultLayout from "@/src/components/Layouts/DefaultLayout";
import { store } from "@/src/stores/recipeStore";
import { ingredientStore } from "@/src/stores/ingredientStore";
import { useCallback, useRef, useState } from "react";
import { Recipe } from "@/src/types/recipe";
import { IngredientQuantity } from "@/src/types/ingredient";

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

  const savedIngredient = (e: any) => {};

  const insertRecipe = (e: any) => {
    const ingredientsData = ingredientsRef.current?.instance
      .getDataSource()
      .items();
    const newRecipe = e.data;
    newRecipe.ingredients = ingredientsData;
    const dataGridInstance = dataGrid.current?.instance;
    // dataGridInstance?.saveEditData();
  };

  const ingredientsGrid = (cellInfo: any) => {
    const ingredientList = Array.isArray(cellInfo.data.ingredients)
      ? cellInfo.data.ingredients
      : [];

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
          const newIngredientList = [...ingredientList, e.data];
          console.log(ingredientList)
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
        <Editing
          allowAdding
          allowDeleting
          allowUpdating
          mode="batch"
        />
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
        // onRowUpdating={savedRecipe}
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
