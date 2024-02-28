import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

export default function Sidebar() {
  const list = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
    >
      <List>
        {['Item 1', 'Item 2', 'Item 3'].map((text, index) => (
          <ListItem button key={text}>
            <ListItemIcon>{/* Insert your icon component here */}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box>
      <Drawer anchor={'left'} open={true} onClose={() => {}}>
        {list()}
      </Drawer>
    </Box>
  );
}