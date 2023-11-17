import type {JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core";
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

    //$def is not part of Draft07
    // if(!_.isEmpty((schema as any)['$defs'])) {
    //     data.definitions = {
    //         type: "object",
    //         properties: (schema as any)['$defs'],
    //     }
    //     data._asDefs = true;
    // }

    return {
        definitions: data
    };
}

export const setOptionData = (schema: JsonSchema | any, uischema: UISchemaElement, data: Record<string, any>): void => {
    let defProps = data?.definitions?.definitions?.properties;

    if(_.isEmpty(defProps)) {
        defProps = undefined;
    }

    if(data?.definitions?._asDefs) {
        schema['$defs'] = defProps;
    }
    else {
        schema.definitions = defProps;
    }
}
