import type {JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
import type {ToolContext} from "../index";
import _ from "lodash";

export const prepareOptionData = (context: ToolContext, schema: JsonSchema, uischema: UISchemaElement): Record<string, any> => {
    const rule = uischema.rule;

    /**
     * :TODO remove ruleBuilder - only use the Formbuilder in "rule"
     */
    /** @ts-ignore */
    const isSchemaBuilder = rule && 'properties' in rule?.condition?.schema;

    return {
        rule: {
            rule: !isSchemaBuilder ? rule : undefined,
            ruleBuilder: isSchemaBuilder ? JSON.parse(JSON.stringify(rule)) : undefined,
        }
    };
}
export const setOptionData = (schema: JsonSchema, uischema: UISchemaElement, data: Record<string, any>): void => {

    let rule = data?.rule?.rule;

    //rules by schemaBuilder
    if (data.rule?.ruleBuilder) {
        rule = data.rule?.ruleBuilder;
    }

    uischema.rule = rule;

    if (_.isEmpty(uischema.rule)) {
        delete uischema.rule;
    }
}
