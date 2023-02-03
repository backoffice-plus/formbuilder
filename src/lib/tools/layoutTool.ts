import type {JsonSchema} from "@jsonforms/core";
import {rankWith} from "@jsonforms/core";
import type {Layout} from "@jsonforms/core/src/models/uischema";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";
import flexArea from "../../components/tools/flexArea.vue";
import {resolveSchema} from "../formbuilder";
import type {ToolInterface} from "../models";
import {Tool} from "../models";
import {schema, uischema, prepareOptionDataRule, setOptionDataRule} from "./schema/toolLayout";


export const verticalLayout = new Tool('VerticalLayout', );

verticalLayout.tester = rankWith(1, uiTypeIs('VerticalLayout'));
verticalLayout.importer = () => flexArea;

verticalLayout.optionJsonforms = async () => {
    return {
        schema: await resolveSchema(schema),
        uischema: await resolveSchema(uischema),
    }
};

verticalLayout.optionDataPrepare = (tool: ToolInterface) => {
    const schema = tool.schema as JsonSchema;
    const uischema = tool.uischema as Layout;

    return {
        options: uischema?.options,
        ...prepareOptionDataRule(schema, uischema),
    };
};

verticalLayout.optionDataUpdate = (tool: ToolInterface, data: Record<string, any>) => {
    const schema = tool.schema as JsonSchema | Record<string, any>;
    const uischema = tool.uischema as Layout;

    uischema.options = data.options ?? {};

    setOptionDataRule(schema, uischema, data);
};


export const horizontalLayout = new Tool('HorizontalLayout');
horizontalLayout.tester = rankWith(1, uiTypeIs('HorizontalLayout'));
horizontalLayout.importer = () => flexArea;
horizontalLayout.optionJsonforms = verticalLayout.optionJsonforms;
horizontalLayout.optionDataPrepare = verticalLayout.optionDataPrepare;
horizontalLayout.optionJsonforms = verticalLayout.optionJsonforms;

