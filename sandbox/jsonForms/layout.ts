export const schema = {
  "type": "object",
  "properties": {
    "string": {
      "type": "string"
    },
    "boolean": {
      "type": "boolean"
    },
    "number": {
      "type": "number"
    },
    "integer": {
      "type": "integer"
    },
    "date": {
      "type": "string",
      "format": "date"
    },
    "enum": {
      "type": "string",
      "enum": [
        "One",
        "Two",
        "Three"
      ]
    },


    //time & date-time is broken
    // "time": {
    //   "type": "string",
    //   "format": "time"
    // },
    // "dateTime": {
    //   "type": "string",
    //   "format": "date-time"
    // },

  }
}


export const uischemaHorizontal = {
  "type": "HorizontalLayout",
  "elements": [
    {
      "type": "Control",
      "label": "Name",
      "scope": "#/properties/name"
    },
    {
      "type": "Control",
      "label": "Birth Date",
      "scope": "#/properties/birthDate"
    }
  ]
}
export const uischemaVertical = {
  "type": "VerticalLayout",
  "elements": [
    {
      "type": "Control",
      "label": "Name",
      "scope": "#/properties/name"
    },
    {
      "type": "Control",
      "label": "Birth Date",
      "scope": "#/properties/birthDate"
    }
  ]
}

export const layoutHorizontal = {schema:schema,uischema:uischemaHorizontal,data:{}};
export const layoutVertical = {schema:schema,uischema:uischemaVertical,data:{}};
