import {registerExamples} from "@jsonforms/examples/src/register";

export const schema = {
    type: 'object',
    properties: {
        countryCode: {
            type: 'string',
            enum: ["CL", "GR", "LV", "PA", "TD", "AD", "ZW", "BB", "BG", "BF", "BI", "GH", "ME", "TH", "ET", "SC", "BT", "UY", "TW", "ML"]
        },
        countryName: {
            type: 'string',
            oneOf: [
                {"const": "GD", "title": "Grenada"},
                {"const": "EE", "title": "Estland"},
                {"const": "SC", "title": "Seychellen"},
                {"const": "ID", "title": "Indonesien"},
                {"const": "PT", "title": "Portugal"},
                {"const": "VN", "title": "Vietnam"},
                {"const": "GB", "title": "Vereinigtes Königreich"},
                {"const": "TG", "title": "Togo"},
                {"const": "MW", "title": "Malawi"},
                {"const": "KH", "title": "Kambodscha"},
                {"const": "GA", "title": "Gabun"},
                {"const": "CU", "title": "Kuba"},
                {"const": "BS", "title": "Bahamas"},
                {"const": "CM", "title": "Kamerun"},
                {"const": "KH", "title": "Kambodscha"},
                {"const": "BN", "title": "Brunei Darussalam"},
                {"const": "BY", "title": "Weißrussland"},
                {"const": "IS", "title": "Island"},
                {"const": "KZ", "title": "Kasachstan"},
                {"const": "LU", "title": "Luxemburg"}
            ]
        },
    },
}
;

export const uischema = {
    type: 'HorizontalLayout',
    elements: [
        {
            type: 'Control',
            scope: '#/properties/countryCode',
            options: {
                autocomplete: true
            }
        },
        {
            type: 'Control',
            scope: '#/properties/countryName',
            options: {
                autocomplete: true
            }
        }
    ]
};

const data = {};

registerExamples([
    {
        name: 'fb-autocomplete-enum',
        label: 'FormBuilder - Autocomplete Enum',
        data,
        schema,
        uischema
    }
]);
