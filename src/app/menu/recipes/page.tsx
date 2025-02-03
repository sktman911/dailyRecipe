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
    newRecipe.ingredients = ingredientsData;
  };

  const insertRecipe = (e: any) => {
    const ingredientsData = ingredientsRef.current?.instance
      .getDataSource()
      .items();
    const newRecipe = e.data;
    newRecipe.ingredients = ingredientsData;
  };

  const savedIngredientWithoutUpdate = () => {
    const ingredientsData = ingredientsRef.current?.instance
      .getDataSource()
      .items();
    const rowKey = dataGrid.current?.instance.option("editing.editRowKey");
    let rowData = dataGrid.current?.instance
      .getVisibleRows()
      .find((row) => row.key === rowKey)?.data;
    if (rowData && !(rowKey as string).startsWith("_DX_KEY_")) {
      const updatedData = { ...rowData, ingredients: ingredientsData };
      const { __typename, ...newUpdatedData } = updatedData;
      rowData = newUpdatedData;
      console.log(rowData);
      store.update(rowData.id, rowData);
    }
  };

  const ingredientsGrid = (cellInfo: any) => {
    let ingredientList = [...cellInfo.data.ingredients];
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

    return (
      <DataGrid
        ref={ingredientsRef}
        dataSource={ingredientList}
        loadPanel={{ enabled: true }}
        key="id"
        showBorders={true}
        onSaving={(e) => {
          if (e.changes.length > 0) {
            const newDatas = [...ingredientList];
            e.changes.forEach((change) => {
              if (change.type === "update") {
                e.cancel = true;
                const index = ingredientList.findIndex(
                  (item) => item.id === change.key.id
                );
                if (index !== -1) {
                  const { __typename, name, ...newData } = change.key;
                  ingredientList[index] = {
                    ...newData,
                    quantity: change.data.quantity,
                  };
                }
              }
            });
            ingredientsRef.current?.instance.option("dataSource", [
              ...ingredientList,
            ]);
            console.log(ingredientList);
          }
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
        // onSaving={savedIngredientWithoutUpdate}
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
          // editCellRender={ingredientsGrid}
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
            items: [
              { dataField: "name" },
              { dataField: "description" },
              // { dataField: "ingredients", colSpan: 2 },
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
        <DataGrid
          dataSource={selectedData}
          keyExpr="id"
          showBorders={true}
          onSaving={savedIngredientWithoutUpdate}
        >
          <Column dataField="name" caption="Tên nguyên liệu" />
          <Column dataField="quantity" caption="Số lượng" dataType="number" />
          <Editing allowAdding allowDeleting allowUpdating />
        </DataGrid>
      </Popup>
    </DefaultLayout>
  );
};

export default Recipes;
