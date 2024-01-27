import * as _ from 'lodash-es';
import {cleanEmptySchema} from "@/lib/tools/SchemaTool";
import type {JsonSchema, UISchemaElement} from "@jsonforms/core";
import type {ToolContext} from "@/lib";

export const prepareOptionData = (context: ToolContext, schema: JsonSchema, uischema: UISchemaElement): Record<string, any> => {
    const rule = uischema.rule;
    return {
        rule: {
            rule: rule ? JSON.parse(JSON.stringify(rule)) : undefined,
        }
    };
}
export const setOptionData = (schema: JsonSchema, uischema: UISchemaElement, data: Record<string, any>): void => {

    let rule = data?.rule?.rule;

    if (rule?.condition && "schema" in rule?.condition) {
        rule.condition.schema = cleanEmptySchema(rule.condition.schema)
    }
    if (rule && "condition" in rule && _.isEmpty(rule.condition)) {
        delete rule.condition;
    }

    uischema.rule = rule;

    if (_.isEmpty(uischema.rule)) {
        delete uischema.rule;
    }
}
