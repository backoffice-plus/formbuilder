import type {JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
import type {JsonFormsInterface} from "../../../models";
import type {ToolContext} from "../../index";

export const schemaKeys = ['title', 'description'] as Array<'title' | 'description'>;
export const uischemaKeys = ['label', 'i18n'] as Array<'label' | 'i18n'>;

export const prepareOptionData = (context:ToolContext, schema:JsonSchema, uischema:UISchemaElement|any) : Record<string, any> => {
    const data = {
        _type:uischema.type,
        //_isUischema: 'uischema' === context.builder || !context?.builder,
        options: {}
    } as Record<string, any>;

    schemaKeys.forEach(key => data[key] = schema[key]);
    uischemaKeys.forEach(key => data[key] = uischema[key]);

    if(undefined !== uischema?.options?.showUnfocusedDescription) {
        data.options = {showUnfocusedDescription:true};
    }

    return {labelAndI18n:data};
}
export const setOptionData = (schema:JsonSchema, uischema:UISchemaElement|any, data:Record<string, any>) : void => {
    schemaKeys.forEach(key => schema[key] = data.labelAndI18n[key]);
    uischemaKeys.forEach(key => uischema[key] = data.labelAndI18n[key]);

    const dataOptions = data?.labelAndI18n?.options;

    if('showUnfocusedDescription' in dataOptions) {
        if(true === dataOptions.showUnfocusedDescription) {
            uischema.options.showUnfocusedDescription = true;
        }
        else {
            uischema.options.showUnfocusedDescription && delete uischema.options.showUnfocusedDescription;
        }
    }
}

export const schema = {
    type: "object",
    properties: {
        labelAndI18n: {
            type: "object",
            properties: {
                _type: {
                    type: "string",
                },
                label: {
                    type: "string",
                },
                title: {
                    type: "string",
                    description: "like label, but stored at schema",
                },
                description: {
                    type: "string",
                },
                i18n: {
                    type: "string",
                    title: 'i18n',
                    description: "alternative lookup key for translation catalogue",
                },
                options: {
                    type: "object",
                    properties: {
                        showUnfocusedDescription: {
                            type: "boolean",
                        },
                    },
                },
            }
        },
    }
}

export const uischema = {
    type: "VerticalLayout",
    elements: [
        {
            type: "HorizontalLayout",
            elements: [
                {
                    scope: "#/properties/labelAndI18n/properties/label",
                    type: "Control",
                    // rule: {
                    //     effect: "HIDE",
                    //     condition: {
                    //         scope: "#/properties/_isUischema",
                    //         schema: {enum: [false, 'null']}
                    //     },
                    // }
                },
                {
                    scope: "#/properties/labelAndI18n/properties/title",
                    type: "Control",
                },
            ]
        },

        {
            type: "HorizontalLayout",
            elements: [
                {
                    scope: "#/properties/labelAndI18n/properties/description",
                    type: "Control",
                    options: {
                        multi: true,
                    },
                    rule: {
                        effect: "HIDE",
                        condition: {
                            type: "OR",
                            conditions: [
                                {
                                    scope: "#/properties/_isSchemaReadOnly",
                                    schema: {const: true}
                                },
                                {
                                    scope: "#/properties/labelAndI18n/properties/_type",
                                    schema: {enum: ['Category','Group']}
                                },
                            ]
                        }
                    },
                },
                {
                    scope: "#/properties/labelAndI18n/properties/options/properties/showUnfocusedDescription",
                    type: "Control",
                    rule: {
                        effect: 'SHOW',
                        condition: {
                            scope: "#/properties/labelAndI18n/properties/_type",
                            schema: { const:'Control' }
                        }
                    }
                },

            ]
        },
        {
            scope: "#/properties/labelAndI18n/properties/i18n",
            type: "Control"
        },
        {
            scope: "#/properties/labelAndI18n/properties/_type",
            type: "Control",
            rule: {
                effect: 'HIDE',
                condition: {}
            }
        },
    ]
};

export const uischemaDescriptionOnly = {
    type: "VerticalLayout",
    elements: [
        {
            scope: "#/properties/labelAndI18n/properties/title",
            type: "Control"
        },
        {
            scope: "#/properties/labelAndI18n/properties/description",
            type: "Control",
            options: {
                multi:true
            }
        },
    ]
};

export const uischemaNoDescription = {
    type: "VerticalLayout",

    elements: [
        {
            type: "HorizontalLayout",
            elements: [
                {
                    scope: "#/properties/labelAndI18n/properties/label",
                    type: "Control",
                },
                {
                    scope: "#/properties/labelAndI18n/properties/title",
                    type: "Control",
                },
            ]
        },

        {
            scope: "#/properties/labelAndI18n/properties/i18n",
            type: "Control"
        },
    ]
};

export const jsonForms = {schema: schema as JsonSchema, uischema: uischema as UISchemaElement} as JsonFormsInterface;

