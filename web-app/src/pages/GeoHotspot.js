import { geocode, RequestType } from "react-geocode";



const address = "1600 Amphitheatre Parkway, Mountain View, CA";
geocode(RequestType.ADDRESS, address)
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.error(error);
  });