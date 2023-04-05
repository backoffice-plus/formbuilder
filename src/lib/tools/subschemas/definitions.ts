import type {JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
import type {ToolContext} from "../../models";
import _ from "lodash";

export const prepareOptionData = (context: ToolContext, schema: JsonSchema, uischema: UISchemaElement): Record<string, any> => {
    const data = {} as Record<string, any>;

    if(!_.isEmpty(schema.definitions)) {
        data.definitions = {
            type: "object",
            properties: schema.definitions,
        }
    }
    if(!_.isEmpty(schema['$defs'])) {
        data.definitions = {
            type: "object",
            properties: schema['$defs'],
        }
        data._asDefs = true;
    }

    return {
        definitions: data
    };
}

export const setOptionData = (schema: JsonSchema | any, uischema: UISchemaElement, data: Record<string, any>): void => {
    const defProps = data?.definitions?.definitions?.properties;

    if(data?.definitions?._asDefs) {
        schema['$defs'] = defProps;
    }
    else {
        schema.definitions = defProps;
    }
}
