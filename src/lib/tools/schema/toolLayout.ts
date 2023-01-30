import type {JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
import type {JsonFormsInterface} from "../../models";
export { prepareOptionData as prepareOptionDataRule, setOptionData as setOptionDataRule } from './rule'

export const schema = {
    type: 'object',
    properties: {
        rule: {
            $ref:'rule.schema#/properties/rule'
        },
    }
}

export const uischema = {

    "type": "Categorization",
    "elements": [
        {
            "type": "Category",
            "label": "Rule",
            "elements": [
                {
                    $ref:'rule.uischema'
                },
            ]
        },
    ]
}

export const jsonForms = {schema:schema as JsonSchema, uischema:uischema as UISchemaElement} as JsonFormsInterface;

