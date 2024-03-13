import React from "react";
import MUIDataTable from "mui-datatables";
import { Button, styled } from "@mui/material";

const StyledTable = styled(MUIDataTable)({
  borderRadius: "15px",
});

const columns = [
  "Name",
  "Date Acquired",
  "Process Date",
  {
    name: "Download",
    options: {
      customBodyRender: () => {
        return (
          <Button variant="contained" color="primary">
            Download
          </Button>
        );
      },
    },
  },
];

const data = [
  ["S2A_MSIL2A", "20/04/23", "20/04/23"],
  ["S2A_MSIL2A", "19/04/23", "19/04/23"],
];

const options = {
  filterType: "checkbox",
  filter: false,
  download: false,
  print: false,
  viewColumns: false,
  search: false,
};

const DataTable = () => {
  return <StyledTable title={"SHAPEFILE LIST"} data={data} columns={columns} options={options} />;
};

export default DataTable;
