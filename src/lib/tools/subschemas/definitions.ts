import type {JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
import type {ToolContext} from "../index";
import _ from "lodash";

export const prepareOptionData = (context: ToolContext, schema: JsonSchema, uischema: UISchemaElement): Record<string, any> => {
    const data = {} as Record<string, any>;

    if(!_.isEmpty(schema.definitions)) {
        data.definitions = {
            type: "object",
            properties: schema.definitions,
        }
    }

    return {definitions: data};
}

export const setOptionData = (schema: JsonSchema | any, uischema: UISchemaElement, data: Record<string, any>): void => {
    schema.definitions = data?.definitions?.definitions?.properties;
}
