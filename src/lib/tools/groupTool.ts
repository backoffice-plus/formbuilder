import type {GroupLayout, JsonSchema} from "@jsonforms/core";
import {rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";
import type {ToolInterface} from "../models";
import {Tool, ToolProps} from "../models";
import flexArea from "../../components/tools/flexArea.vue";
import {resolveSchema} from "../formbuilder";
import {
    schema,uischema,
    prepareOptionDataLabel,
    prepareOptionDataRule,
    setOptionDataLabel,
    setOptionDataRule
} from "./schema/toolGroup";
import _ from "lodash";

export const groupTool = new Tool('flexArea', ToolProps.create({
    toolType: 'group',
    jsonForms: {uischema: {type: 'Group'}}
}), rankWith(1, uiTypeIs('Group')));

groupTool.importer = () => flexArea;

groupTool.optionJsonforms = async () => {
    return {
        schema: await resolveSchema(schema),
        uischema: await resolveSchema(uischema),
    }
};

groupTool.optionDataPrepare = (tool: ToolInterface) => {
    const schema = tool.props.jsonForms.schema as JsonSchema;
    const uischema = tool.props.jsonForms.uischema as GroupLayout;

    const data = {};

    _.merge(
        data,
        prepareOptionDataLabel(schema, uischema),
        prepareOptionDataRule(schema, uischema),
    )
    return data;
};

groupTool.optionDataUpdate = (tool: ToolInterface, data: any) => {
    const schema = tool.props.jsonForms.schema as JsonSchema | Record<string, any>;
    const uischema = tool.props.jsonForms.uischema as GroupLayout;

    uischema.options = data.options ?? {};

    setOptionDataLabel(schema, uischema, data);
    setOptionDataRule(schema, uischema, data);
};
