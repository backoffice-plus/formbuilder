import {registerExamples} from "@jsonforms/examples/src/register";
import {data} from "./default";

export const schema = {
  type: 'object',
  properties: {
    imageDataUri: {
      type: 'string',
      format: "uri",
      contentEncoding: "base64",
      contentMediaType: "image/*",
      description: "Image encoded as data URI"
    },
    fileDataUriWithFileName: {
      type: "string",
      format: "binary",
      //formatMaximum: "1048576",
      description: "File with maximum size of 1MB encoded as data URI and including the file name"
    },
    base64String: {
      type: "string",
      contentEncoding: "base64",
      description: "File encoded as base64"
    }
  },
};

export const uischema = {
    type: 'VerticalLayout',
    elements: [
      {
        type: 'Control',
        scope: '#/properties/imageDataUri'
      },
      {
        type: 'Control',
        scope: '#/properties/fileDataUriWithFileName'
      },
      {
        type: 'Control',
        scope: '#/properties/base64String'
      },
    ]
};


registerExamples([
  {
    name: 'fb.file',
    label: 'FormBuilder - File',
    data,
    schema,
    uischema
  }
]);
