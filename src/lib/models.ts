import type {JsonSchema} from "@jsonforms/core";
import type {
    Categorization,
    Category,
    ControlElement,
    LabelElement,
    Layout,
    UISchemaElement,
} from "@jsonforms/core/src/models/uischema";

export const scalarTypes = ['string', 'number', 'integer', 'boolean', 'null'];

// @ts-ignore
export interface JsonFormsUISchema extends UISchemaElement, LabelElement, ControlElement, Category, Categorization {
    type: string
}

//root JsonForms
export interface JsonFormsInterface {
    schema: JsonSchema;
    uischema: Layout;
}
