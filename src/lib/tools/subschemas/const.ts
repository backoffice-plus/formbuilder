import type {JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
import type {ToolContext} from "../../models";

export const prepareOptionData = (context: ToolContext, schema: JsonSchema, uischema: UISchemaElement): Record<string, any> => {
    const subdata = {
        const: schema.const,
        parseAs: undefined,
    } as any;

    if (null === subdata.const) {
        subdata.const = 'null';
        subdata.parseAs = 'null';
    } else if (['array', 'object'].includes(typeof subdata.const)) {
        subdata.const = JSON.stringify(subdata.const);
        subdata.parseAs = 'json';
    }

    return {const: subdata};
}
export const setOptionData = (schema: JsonSchema, uischema: UISchemaElement, data: Record<string, any>): void => {
    const subdata = data.const;

    schema.const = subdata.const;
    //this.schema.title = data.title;

    if ('string' === typeof subdata.const) {
        if ('json' === subdata.parseAs && subdata.const.match(/^[\[{].*[\]}]$/)) {
            try {
                const json = JSON.parse(subdata.const)
                schema.const = json;
            } catch (e) {
            }
        } else if ('null' === subdata.parseAs && 'null' === subdata.const) {
            schema.const = null;
        }
    }

    delete schema.type; //no type for const, right?!
}
