// SwaggerComponent.js
import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

function SwaggerComponent() {
  return <SwaggerUI url="http://petstore.swagger.io/v2/swagger.json" />;
}

export default SwaggerComponent;