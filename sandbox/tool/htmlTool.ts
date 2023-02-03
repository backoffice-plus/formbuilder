import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
import type {ToolInterface} from "../../src";
import {resolveSchema, Tool, ToolProps} from "../../src";
import {
    prepareOptionDataRule,
    setOptionDataRule
} from "../../src/lib/tools/schema/toolLayout";
import htmlToolComponent from "./htmlToolComponent.vue";
import htmlRenderer from "./htmlRenderer.vue";
import {entry as htmlControlRenderer} from "./htmlControlRenderer.vue";
import {schema,uischema} from "./htmlToolSchema";


export const tool = new Tool('html','Html', htmlRenderer.tester);
tool.uischema.options = {body: '<code>HTML Tool</code>'};

tool.importer = () => htmlToolComponent;
tool.optionJsonformsRenderer = () : any => {
    return [
        htmlControlRenderer
    ]
};

tool.optionJsonforms = async () => {
    return {
        schema: await resolveSchema(schema),
        uischema: await resolveSchema(uischema),
    }
};

tool.optionDataPrepare = (tool: ToolInterface) : any => {

    return {
        options: tool.uischema.options ?? {},
        ...prepareOptionDataRule(tool.schema, uischema),
    };
};

tool.optionDataUpdate = (tool: ToolInterface, data: any) : void => {
    tool.uischema.options = data.options ?? {};

    setOptionDataRule(tool.schema, tool.uischema, data);
};
