const schemaEnum = {
  "type": "object",
  "properties": {
    "multiEnum": {
      "type": "array",
      "uniqueItems": true,
      "items": {
        "type": "string",
        "enum": [
          "foo",
          "bar",
          "foobar"
        ]
      }
    }
  }
}

const schemaOneOff = {
  "type": "object",
  "properties": {
    "oneOfMultiEnum": {
      "type": "array",
      "uniqueItems": true,
      "items": {
        "oneOf": [
          {
            "const": "foo",
            "title": "My Foo"
          },
          {
            "const": "bar",
            "title": "My Bar"
          },
          {
            "const": "foobar",
            "title": "My FooBar"
          }
        ]
      }
    }
  }
};

const uischemaEnum = {
  "type": "VerticalLayout",
  "elements": [
    {
      "type": "Control",
      "scope": "#/properties/multiEnum"
    }
  ]
}
const uischemaOneOf = {
  "type": "VerticalLayout",
  "elements": [
    {
      "type": "Control",
      "scope": "#/properties/oneOfMultiEnum"
    }
  ]
}


export const layoutEnum = {schema:schemaEnum,uischema:uischemaEnum,data: {}};
export const layoutOneOf = {schema:schemaOneOff,uischema:uischemaOneOf,data: {}};
