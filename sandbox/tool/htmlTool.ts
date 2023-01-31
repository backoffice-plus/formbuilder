import type {JsonSchema} from "@jsonforms/core";
import type {LabelElement, UISchemaElement} from "@jsonforms/core/src/models/uischema";
import type {ToolInterface} from "../../src";
import {resolveSchema, Tool, ToolProps} from "../../src";
import {
    prepareOptionDataRule,
    setOptionDataRule
} from "../../src/lib/tools/schema/toolLayout";
import htmlToolComponent from "./htmlToolComponent.vue";
import {jsonForms} from "./htmlToolSchema";
import {rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";


export const tool = new Tool('html', ToolProps.create({
    toolType: 'html',
    jsonForms: {schema:{}, uischema: {type: 'Html', options: {body: '<code>HTML Tool</code>'}}},
}), rankWith(1, uiTypeIs('Html')));
//}), rendererEntry.tester);

tool.importer = () => htmlToolComponent;

tool.optionJsonforms = async () => {
    return {
        schema: await resolveSchema(jsonForms.schema),
        uischema: await resolveSchema(jsonForms.uischema),
    }
};

tool.optionDataPrepare = (tool: ToolInterface) => {
    const schema = tool.props.jsonForms.schema as JsonSchema;
    const uischema = tool.props.jsonForms.uischema as UISchemaElement;

    return {
        options: uischema.options ?? {},
        ...prepareOptionDataRule(schema, uischema),
    } as any;
};

tool.optionDataUpdate = (tool: ToolInterface, data: any) => {
    const schema = tool.props.jsonForms.schema as JsonSchema | Record<string, any>;
    const uischema = tool.props.jsonForms.uischema as LabelElement;

    uischema.options = data.options ?? {};

    setOptionDataRule(schema, uischema, data);
};
