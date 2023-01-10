const schema = {
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 3,
      //"description": "Please enter your name",
      "i18n": "nameI18n"
    } ,
  },
};

const uischema = {
  "type": "HorizontalLayout",
  "elements": [
    {
      "type": "Control",
      "scope": "#/properties/name",
      "label": "name",
      //"i18n": "customName",
      "options": {
        "placeholder": "Your Name",
      }
    },
  ]
};

export default {schema:schema,uischema:uischema,data: {}};
