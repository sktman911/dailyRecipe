/* eslint-disable @next/next/no-img-element */
"use client";
import DataGrid, { Column, Editing } from "devextreme-react/data-grid";
import LoadPanel from "devextreme-react/load-panel";
import { SpeedDialAction } from "devextreme-react/speed-dial-action";
import FileUploader from "devextreme-react/file-uploader";
import DefaultLayout from "@/src/components/Layouts/DefaultLayout";
import { store } from "@/src/stores/ingredientStore";
import { useCallback, useRef } from "react";
import useImageUpload from "@/src/hooks/useImageUpload";
import React from "react";
import defaultImg from "@/src/assets/images/defaultImage.png";
import client from "@/src/schema/client";
import { CHECK_INGREDIENTNAME } from "@/src/queries/ingredientQueries";
import query from "devextreme/data/query";

const Ingredients = () => {
  const dataGrid = useRef<DataGrid>(null);
  const fileUploaderRef = useRef<FileUploader>(null);
  const loadPanel = useRef<LoadPanel>(null);
  const { imgPreviewRef, handleImageUpload } = useImageUpload();

  const addRow = useCallback(
    (e: any) => {
      dataGrid.current?.instance.addRow();
    },
    [dataGrid]
  );

  const handleFileUploader = useCallback(
    async (
      files: File[] | null
    ): Promise<{ url: string; publicId: string } | null> => {
      const file = files![0];

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "ingredients_preset");
      formData.append("folder", "ingredients");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/dzc96dfwn/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const image = await res.json();
      return { url: image.secure_url, publicId: image.public_id };
    },
    []
  );

  const insertData = useCallback(async (e: any) => {
    loadPanel.current?.instance.option("visible", true);
    e.cancel = true;
    const files = fileUploaderRef.current?.instance.option("value");
    if (files && files.length > 0) {
      const uploadedImage = await handleFileUploader(files);
      e.data.image = uploadedImage?.url;
      e.data.imagePublicId = uploadedImage?.publicId;
    }
    await store.insert(e.data);
    dataGrid.current?.instance.refresh();
    dataGrid.current?.instance.cancelEditData();
    loadPanel.current?.instance.option("visible", false);
    fileUploaderRef.current?.instance.option("value", []);
  }, []);

  const updateDataWithImage = useCallback(async (e: any, rowData: any) => {
    loadPanel.current?.instance.option("visible", true);
    e.cancel = true;
    const files = fileUploaderRef.current?.instance.option("value");
    const uploadedImage = await handleFileUploader(files!);
    const data = {
      ...rowData,
      image: uploadedImage?.url,
      imagePublicId: uploadedImage?.publicId,
    };

    const { __typename, ...newData } = data;

    await store.update(rowData.id, newData);
    dataGrid.current?.instance.refresh();
    dataGrid.current?.instance.cancelEditData();
    loadPanel.current?.instance.option("visible", false);
    fileUploaderRef.current?.instance.option("value", []);
  }, []);

  const isExitedName = useCallback(async (name : string) => {
    const res = await client.query({ query: CHECK_INGREDIENTNAME,variables:{name: name}});
    return res.data.checkIngredientName.success;
  }, []);

  return (
    <DefaultLayout>
      <DataGrid
        dataSource={store}
        showBorders={true}
        height={"auto"}
        noDataText="Chưa có dữ liệu"
        ref={dataGrid}
        onRowInserting={async (e) => await insertData(e)}
      >
        <Column
          dataField="STT"
          caption="STT"
          width={100}
          cellRender={(cellData) => cellData.rowIndex + 1}
        />
        <Column
          dataField="name"
          caption="Tên nguyên liệu"          
          validationRules={[
            { type: "required", message: "Vui lòng nhập tên nguyên liệu" },
            {type: "custom", message:"Tên nguyên liệu đã có trong hệ thống.", 
              validationCallback: async (e) => {
                return await  isExitedName(e.value);
              }
            }
          ]}
        />
        <Column
          dataField="image"
          caption="Hình ảnh"
          cellRender={(data) => (
            <img
              src={data.value ? data.value : defaultImg.src}
              className="w-20 h-20"
              alt="Alt"
            />
          )}
          editCellRender={() => (
            <div className="flex justify-between">
              <FileUploader
                ref={fileUploaderRef}
                accept="image/*"
                multiple={false}
                selectButtonText="Chọn file"
                labelText=""
                uploadMode="instantly"
                onValueChanged={(e: any) => {
                  const file = e.value[0];
                  handleImageUpload(file);
                }}
              />
            </div>
          )}
        />
        <Column
          visible={false}
          dataField="preview"
          caption="Xem ảnh"
          editCellRender={(e: any) => (
            <div className="w-80 h-60 mx-auto">
              <img
                className="h-full w-full mx-auto object-cover"
                ref={imgPreviewRef}
                alt="Alt"
                src={e.data.image ? e.data.image : defaultImg.src}
              />
            </div>
          )}
        />
        <Column dataField="description" caption="Mô tả" />
        <Editing
          allowUpdating={true}
          allowDeleting={true}
          mode="popup"
          useIcons={true}
          popup={{
            width: 900,
            height: 600,
            showTitle: true,
            title: "Nguyên liệu",
            toolbarItems: [
              {
                widget: "dxButton",
                location: "after",
                toolbar: "bottom",
                options: {
                  text: "Lưu",
                  onClick: async (e: any) => {
                    const rowKey =
                      dataGrid.current?.instance.option("editing.editRowKey");
                      console.log(rowKey)
                    const rowData = dataGrid.current?.instance
                      .getVisibleRows()
                      .find((row) => row.key === rowKey)?.data;
                    const files =
                      fileUploaderRef.current?.instance.option("value");
                    if (files && files.length > 0 && !(rowKey as string).startsWith("_DX_KEY_"))
                   {
                      await updateDataWithImage(e, rowData);
                    } else {
                      dataGrid.current?.instance.saveEditData();
                    }
                  },
                },
              },
              {
                widget: "dxButton",
                location: "after",
                toolbar: "bottom",
                options: {
                  text: "Hủy",
                  onClick: () => {
                    dataGrid.current?.instance.cancelEditData();
                  },
                },
              },
            ],
          }}
          form={{
            items: [
              { dataField: "name" },
              { dataField: "description" },
              { dataField: "image", label: { text: "Chọn ảnh" } },
              { dataField: "preview" },
            ],
          }}
        ></Editing>
        <SpeedDialAction icon="add" label="Thêm mới" onClick={addRow} />
      </DataGrid>

      <LoadPanel
        ref={loadPanel}
        message=""
        shadingColor="rgba(0, 0, 0, 0.4)"
        shading={true}
        showIndicator={true}
        hideOnOutsideClick={false}
        position={{ of: window }}
      />
    </DefaultLayout>
  );
};

export default Ingredients;
