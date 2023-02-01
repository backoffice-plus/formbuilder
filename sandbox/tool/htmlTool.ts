import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
import type {ToolInterface} from "../../src";
import {resolveSchema, Tool, ToolProps} from "../../src";
import {
    prepareOptionDataRule,
    setOptionDataRule
} from "../../src/lib/tools/schema/toolLayout";
import htmlToolComponent from "./htmlToolComponent.vue";
import htmlRenderer from "./htmlRenderer.vue";
import {schema,uischema} from "./htmlToolSchema";


export const tool = new Tool('html', ToolProps.create({
    toolType: 'html',
    jsonForms: {schema:{}, uischema: {type: 'Html', options: {body: '<code>HTML Tool</code>'}}},
}), htmlRenderer.tester);

tool.importer = () => htmlToolComponent;

tool.optionJsonforms = async () => {
    return {
        schema: await resolveSchema(schema),
        uischema: await resolveSchema(uischema),
    }
};

tool.optionDataPrepare = (tool: ToolInterface) : any => {
    const schema = tool.props.jsonForms.schema;
    const uischema = tool.props.jsonForms.uischema as UISchemaElement;

    return {
        options: uischema.options ?? {},
        ...prepareOptionDataRule(schema, uischema),
    };
};

tool.optionDataUpdate = (tool: ToolInterface, data: any) : void => {
    const schema = tool.props.jsonForms.schema;
    const uischema = tool.props.jsonForms.uischema as UISchemaElement;

    uischema.options = data.options ?? {};

    setOptionDataRule(schema, uischema, data);
};
