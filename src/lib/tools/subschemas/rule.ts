import type {JsonSchema, SchemaBasedCondition} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core";
import type {ToolContext} from "../../models";
import * as _ from 'lodash-es';

export const prepareOptionData = (context: ToolContext, schema: JsonSchema, uischema: UISchemaElement): Record<string, any> => {
    const rule = uischema.rule;

    /**
     * :TODO remove ruleBuilder - only use the Formbuilder in "rule"
     */
    /** @ts-ignore */
    const isSchema = rule?.condition?.schema;
    const isSchemaBuilder = isSchema && 'properties' in (rule?.condition as SchemaBasedCondition)?.schema;

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
