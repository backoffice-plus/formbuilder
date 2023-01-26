import type {JsonSchema} from "@jsonforms/core";
import {and, rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";
import referenceComp from "../../components/tools/reference.vue";
import type {ToolInterface} from "../models";
import {Tool, ToolProps} from "../models";
import {jsonForms as toolOptionsReference} from "../../schema/toolOptionsReference";


export const referenceTool = new Tool('reference', ToolProps.create({
        toolType: 'reference',
        jsonForms: {schema: {}, uischema: {type: 'Control'}}
    }),
    rankWith(1,
        and(
            uiTypeIs('Control'),
            (uischema, schema) => undefined !== schema?.$ref
        )
    ));
referenceTool.importer = () => referenceComp;
referenceTool.optionJsonforms = toolOptionsReference;

referenceTool.optionDataPrepare = (tool: ToolInterface) => {
    const data = {} as any;

    const schema = tool.props.jsonForms.schema as JsonSchema;

    data.propertyName = tool.props.propertyName;

    if (undefined !== schema.$ref) {
        data._reference = schema.$ref
    }

    return data;
};

referenceTool.optionDataUpdate = (tool: ToolInterface, data: any) => {
    const schema = tool.props.jsonForms.schema as JsonSchema;

    tool.props.propertyName = data.propertyName;

    if (undefined !== data._reference) {
        schema.$ref = data._reference;
    }
};
