import React, { useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { Button, styled } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { fetchGetFile } from '../reducers/tableSlice';
import axios from "axios";
import './table.css';
import CONFIG from '../config';

const StyledTable = styled(MUIDataTable)({
  borderRadius: "15px",
});

const DataTable = () => {
  const dispatch = useDispatch();
  const getFile = useSelector((state) => state.table.data);
  // YOUR FILE LOCATION

  const dataTable = getFile.map((entry) => entry);

  const downloadFile = async (filepath) => {
    const payload = {
      filepath: filepath,
    };
    try {
      const response = await axios.post(CONFIG.API_URL+"/getZipFile", payload, { responseType: "blob" });
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

  useEffect(() => {
    dispatch(fetchGetFile());
  }, [dispatch]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  const data = dataTable.map((obj) => [
    obj.file_name ?? "",
    formatDate(obj.acqire_date) ?? "",
    formatDate(obj.process_date) ?? "",
    obj.file_path ?? "",
  ]);

  const columns = [
    {
      name: "Name",
      options: {
        // setCellProps: () => ({
        //   align: "center",
        // }),
      },
    },
    {
      name: "Date Acquired",
      options: {
        // setCellProps: () => ({
        //   align: "center",
        // }),
      },
    },
    {
      name: "Process Date",
      options: {
        // setCellProps: () => ({
        //   align: "center",
        // }),
      },
    },
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
    selectableRows: 'none', 
    setTableProps: () => {
      return {
        style: {
          textAlign: 'center',
        },
      };
    },
  };

  return <StyledTable title={<h1>SHAPEFILE LIST</h1>} data={data} columns={columns} options={options} />;
};

export default DataTable;
