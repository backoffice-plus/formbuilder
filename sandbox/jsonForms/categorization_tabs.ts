const schema = {
  "type": "object",
  "properties": {
    "firstName": {
      "type": "string",
      "minLength": 3,
      "description": "Please enter your first name"
    },
    "secondName": {
      "type": "string",
      "minLength": 3,
      "description": "Please enter your second name"
    },
    "vegetarian": {
      "type": "boolean"
    },
    "birthDate": {
      "type": "string",
      "format": "date",
      "description": "Please enter your birth date."
    },
    "nationality": {
      "type": "string",
      "enum": [
        "DE",
        "IT",
        "JP",
        "US",
        "RU",
        "Other"
      ]
    },
    "provideAddress": {
      "type": "boolean"
    },
    "address": {
      "type": "object",
      "properties": {
        "street": {
          "type": "string"
        },
        "streetNumber": {
          "type": "string"
        },
        "city": {
          "type": "string"
        },
        "postalCode": {
          "type": "string",
          "maxLength": 5
        }
      }
    },
    "vegetarianOptions": {
      "type": "object",
      "properties": {
        "vegan": {
          "type": "boolean"
        },
        "favoriteVegetable": {
          "type": "string",
          "enum": [
            "Tomato",
            "Potato",
            "Salad",
            "Aubergine",
            "Cucumber",
            "Other"
          ]
        },
        "otherFavoriteVegetable": {
          "type": "string"
        }
      }
    }
  }
}

const uischema = {
  "type": "Categorization",
  "elements": [
    {
      "type": "Category",
      "label": "categoryLabelKey",
      "elements": [
        {
          "type": "HorizontalLayout",
          "elements": [
            {
              "type": "Control",
              "scope": "#/properties/firstName"
            },
            {
              "type": "Control",
              "scope": "#/properties/secondName"
            }
          ]
        },
        {
          "type": "HorizontalLayout",
          "elements": [
            {
              "type": "Control",
              "scope": "#/properties/birthDate"
            },
            {
              "type": "Control",
              "scope": "#/properties/nationality"
            }
          ]
        }
      ]
    },
    {
      "type": "Category",
      "i18n": "address",
      "elements": [
        {
          "type": "HorizontalLayout",
          "elements": [
            {
              "type": "Control",
              "scope": "#/properties/address/properties/street"
            },
            {
              "type": "Control",
              "scope": "#/properties/address/properties/streetNumber"
            }
          ]
        },
        {
          "type": "HorizontalLayout",
          "elements": [
            {
              "type": "Control",
              "scope": "#/properties/address/properties/city"
            },
            {
              "type": "Control",
              "scope": "#/properties/address/properties/postalCode"
            }
          ]
        }
      ],
    },
    {
      "type": "Category",
      "label": "Additional",
      "elements": [
        {
          "type": "Control",
          "scope": "#/properties/vegetarianOptions/properties/vegan"
        },
        {
          "type": "Control",
          "scope": "#/properties/vegetarianOptions/properties/favoriteVegetable"
        },
        {
          "type": "Control",
          "scope": "#/properties/vegetarianOptions/properties/otherFavoriteVegetable",
          "rule": {
            "effect": "SHOW",
            "condition": {
              "scope": "#/properties/vegetarianOptions/properties/favoriteVegetable",
              "schema": {
                "const": "Other"
              }
            }
          }
        }
      ],
    }
  ]
}

export default {schema:schema,uischema:uischema,data:{}};
