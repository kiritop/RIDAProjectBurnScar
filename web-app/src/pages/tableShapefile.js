import React from "react";
import MUIDataTable from "mui-datatables";
import { Button, styled } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { fetchGetFile } from "../reducers/getfilepath";
import axios from "axios";

const StyledTable = styled(MUIDataTable)({
  borderRadius: "15px",
});

const DataTable = () => {
  const dispatch = useDispatch();
  const getFile = useSelector((state) => state.getFile.data ?? []);
  // YOUR FILE LOCATION

  const dataTable = getFile.map((entry) => entry);

  const downloadFile = async (filepath) => {
    const payload = {
      filepath: filepath,
    };

    try {
      const response = await axios.post("http://localhost:3000/getZipFile", payload, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "burnt.zip");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error(`Error: ${error}`);
    }
  };

  React.useEffect(() => {
    dispatch(fetchGetFile());
  }, [dispatch]);

  const data = dataTable.map((obj) => [
    obj.file_name ?? "",
    obj.acqire_date ?? "",
    obj.process_date ?? "",
    obj.file_path ?? "",
  ]);

  const columns = [
    "Name",
    "Date Acquired",
    "Process Date",
    {
      name: "Download",
      options: {
        customBodyRender: (value) => {
          return (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                downloadFile(value);
                console.log(value);
              }}
            >
              Download
            </Button>
          );
        },
      },
    },
  ];

  const options = {
    filterType: "checkbox",
    filter: false,
    download: false,
    print: false,
    viewColumns: false,
    search: false,
  };

  return <StyledTable title={<h1>SHAPEFILE LIST</h1>} data={data} columns={columns} options={options} />;
};

export default DataTable;