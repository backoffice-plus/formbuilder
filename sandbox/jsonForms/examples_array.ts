const schema = {
  "type": "object",
  "properties": {
    "comments": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "date": {
            "type": "string",
            "format": "date"
          },
          "message": {
            "type": "string",
            "maxLength": 5
          },
          "enum": {
            "type": "string",
            "enum": [
              "foo",
              "bar"
            ]
          }
        }
      }
    }
  }
}

const uischema = {
  "type": "VerticalLayout",
  "elements": [
    {
      "type": "Control",
      "scope": "#/properties/comments"
    }
  ]
}
export const exampleArray = {schema:schema,uischema:uischema,data: {}};
