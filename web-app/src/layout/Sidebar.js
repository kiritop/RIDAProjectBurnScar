// Sidebar.js
import * as React from 'react';
import AspectRatio from '@mui/joy/AspectRatio';
import Box from '@mui/joy/Box';
import Drawer from '@mui/joy/Drawer';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Checkbox from '@mui/joy/Checkbox';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import ModalClose from '@mui/joy/ModalClose';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import Stack from '@mui/joy/Stack';
import RadioGroup from '@mui/joy/RadioGroup';
import Radio from '@mui/joy/Radio';
import Sheet from '@mui/joy/Sheet';
import Switch from '@mui/joy/Switch';
import Typography from '@mui/joy/Typography';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import HotelRoundedIcon from '@mui/icons-material/HotelRounded';
import Done from '@mui/icons-material/Done';
import { Paper } from '@mui/material';
import Slider from "@mui/material/Slider";

export default function Sidebar({ isOpen , toggleDrawer}) {

  const [year, setYear] = React.useState(2022);
  const colors = ['#feb9b9', '#f88', '#ff5757', '#ff2626', '#f40000', '#c30000', '#920000', '#610000', '#300000'];
  const [type, setType] = React.useState('Guesthouse');
  const [amenities, setAmenities] = React.useState([0, 6]);
  const [yearRange, setYearRange] = React.useState([2019, 2024]);

  const handleSliderChange = (event, newValue) => {
    setYear(newValue);
  };

  //set year range 
  const handleYearChange = (event, newValue) => {
    setYearRange(newValue);
  };


  return (
    <Drawer
    size="md"
    anchor="right"
    variant="plain"
    open={isOpen}
    onClose={toggleDrawer}
    slotProps={{
      content: {
        sx: {
          bgcolor: 'transparent',
          p: { md: 3, sm: 0 },
          boxShadow: 'none',
        },
      },
    }}
  >
    <Sheet
      sx={{
        borderRadius: 'md',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        height: '100%',
        overflow: 'auto',
      }}
    >
      <DialogTitle>Filters</DialogTitle>
      <ModalClose />
      <Divider sx={{ mt: 'auto' }} />
      <DialogContent sx={{ gap: 2 }}>
        {/* <FormControl>
          <FormLabel sx={{ typography: 'title-md', fontWeight: 'bold' }}>
            Property type
          </FormLabel>
          <RadioGroup
            value={type || ''}
            onChange={(event) => {
              setType(event.target.value);
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: 1.5,
              }}
            >
              {[
                {
                  name: 'House',
                  icon: <HomeRoundedIcon />,
                },
                {
                  name: 'Apartment',
                  icon: <ApartmentRoundedIcon />,
                },
                {
                  name: 'Guesthouse',
                  icon: <MeetingRoomRoundedIcon />,
                },
                {
                  name: 'Hotel',
                  icon: <HotelRoundedIcon />,
                },
              ].map((item) => (
                <Card
                  key={item.name}
                  sx={{
                    boxShadow: 'none',
                    '&:hover': { bgcolor: 'background.level1' },
                  }}
                >
                  <CardContent>
                    {item.icon}
                    <Typography level="title-md">{item.name}</Typography>
                  </CardContent>
                  <Radio
                    disableIcon
                    overlay
                    checked={type === item.name}
                    variant="outlined"
                    color="neutral"
                    value={item.name}
                    sx={{ mt: -2 }}
                    slotProps={{
                      action: {
                        sx: {
                          ...(type === item.name && {
                            borderWidth: 2,
                            borderColor:
                              'var(--joy-palette-primary-outlinedBorder)',
                          }),
                          '&:hover': {
                            bgcolor: 'transparent',
                          },
                        },
                      },
                    }}
                  />
                </Card>
              ))}
            </Box>
          </RadioGroup>
        </FormControl> */}

       

        {/* <Typography level="title-md" fontWeight="bold" sx={{ mt: 1 }}>
          Amenities
        </Typography>
        <div role="group" aria-labelledby="rank">
          <List
            orientation="horizontal"
            size="sm"
            sx={{
              '--List-gap': '12px',
              '--ListItem-radius': '20px',
            }}
          >
            {['Wi-fi', 'Washer', 'A/C', 'Kitchen'].map((item, index) => {
              const selected = amenities.includes(index);
              return (
                <ListItem key={item}>
                  <AspectRatio
                    variant={selected ? 'solid' : 'outlined'}
                    color={selected ? 'primary' : 'neutral'}
                    ratio={1}
                    sx={{ width: 20, borderRadius: 20, ml: -0.5, mr: 0.75 }}
                  >
                    <div>{selected && <Done fontSize="md" />}</div>
                  </AspectRatio>
                  <Checkbox
                    size="sm"
                    color="neutral"
                    disableIcon
                    overlay
                    label={item}
                    variant="outlined"
                    checked={selected}
                    onChange={(event) =>
                      setAmenities((prev) => {
                        const set = new Set([...prev, index]);
                        if (!event.target.checked) {
                          set.delete(index);
                        }
                        // @ts-ignore
                        return [...set];
                      })
                    }
                    slotProps={{
                      action: {
                        sx: {
                          '&:hover': {
                            bgcolor: 'transparent',
                          },
                        },
                      },
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
        </div> */}

        <Typography level="title-md" fontWeight="bold" sx={{ mt: 1 }}>
         Burnt frequency
        </Typography>
        <FormControl orientation="horizontal">
          <Box display="flex" justifyContent="center" alignItems="center" padding={2}>
            {colors.map((color, index) => (
              <Box key={index} display="flex" flexDirection="column" alignItems="center" margin={1}>
                <Paper
                  sx={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: color,
                    marginBottom: 1,
                  }}
                />
                <Typography>{index + 1}</Typography>
              </Box>
            ))}
          </Box>
        </FormControl>
        <Typography level="title-md" fontWeight="bold" sx={{ mt: 2 }}>
          Year Range
        </Typography>

        <FormControl orientation="horizontal">
          <Box sx={{ flex: 1, pr: 1 }}>
            <Stack spacing={2} direction="row" alignItems="center">
              <Slider
                value={yearRange}
                onChange={handleYearChange}
                valueLabelDisplay="on"
                min={2015}
                max={2030}
                step={1}
                sx={{color: '#ae1b1f' }}
              />
            </Stack>
          </Box>
        </FormControl>

        <Typography level="title-md" fontWeight="bold" sx={{ mt: 2 }}>
          Map Layer
        </Typography>
        <FormControl orientation="horizontal">
          <Box sx={{ flex: 1, pr: 1 }}>
            <FormLabel sx={{ typography: 'title-sm' }}>
              Burnt Scar Layer
            </FormLabel>
            <FormHelperText sx={{ typography: 'body-sm' }}>
              Description for burn scar map
            </FormHelperText>
          </Box>
          <Switch color="warning" checked/>
        </FormControl>

        <FormControl orientation="horizontal">
          <Box sx={{ flex: 1, mt: 1, mr: 1 }}>
            <FormLabel sx={{ typography: 'title-sm' }}>Aqi Layer</FormLabel>
            <FormHelperText sx={{ typography: 'body-sm' }}>
            Description for PM 2.5
            </FormHelperText>
          </Box>
          <Switch color="warning" />
        </FormControl>

        <FormControl orientation="horizontal">
          <Box sx={{ flex: 1, mt: 1, mr: 1 }}>
            <FormLabel sx={{ typography: 'title-sm' }}>Hot spot layer</FormLabel>
            <FormHelperText sx={{ typography: 'body-sm' }}>
            Description for Hot spot
            </FormHelperText>
          </Box>
          <Switch color="warning" />
        </FormControl>
      </DialogContent>

      <Divider sx={{ mt: 'auto' }} />
      <Stack
        direction="row"
        justifyContent="space-between"
        useFlexGap
        spacing={1}
      >
        <Button
          variant="outlined"
          color="neutral"
          onClick={() => {
            setType('');
            setAmenities([]);
          }}
        >
          Clear
        </Button>
        <Button onClick={toggleDrawer}>Save</Button>
      </Stack>
    </Sheet>
  </Drawer>
  );
}