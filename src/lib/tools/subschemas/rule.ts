import type {JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
import type {ToolContext} from "../index";
import _ from "lodash";

export const prepareOptionData = (context: ToolContext, schema: JsonSchema, uischema: UISchemaElement): Record<string, any> => {
    const rule = uischema.rule;

    const ruleSchema = uischema.rule?.condition?.schema;

    const isSchemaBuilder = ruleSchema && 'properties' in ruleSchema;

    //console.log("rule.prepareOptionData ruleSchema", ruleSchema)

    return {
        rule: {
            rule: !isSchemaBuilder ? rule : undefined,
            ruleSchema: ruleSchema ? JSON.parse(JSON.stringify(ruleSchema)) : undefined,
        }
    };
}
export const setOptionData = (schema: JsonSchema, uischema: UISchemaElement, data: Record<string, any>): void => {

    let rule = data?.rule?.rule;

    //console.log("rule.setOptionData data.rule", data.rule)

    //ruleSchema (WIP)
    if (data.rule?.ruleSchema) {
        //console.log("rule.setOptionData data.rule.ruleSchema", data.rule?.ruleSchema)

        /**
         * :TODO hier weiter
         * - read/write effect & scope
         */
        rule = {
            "effect": "ENABLE",
            "condition": {
                "scope": "#",
                "schema": data.rule?.ruleSchema ?? {}
            }
        }
    }

    uischema.rule = rule;

    if (_.isEmpty(uischema.rule)) {
        delete uischema.rule;
    }
}
