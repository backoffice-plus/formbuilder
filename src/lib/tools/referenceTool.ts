import type {JsonSchema} from "@jsonforms/core";
import {and, rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";
import referenceComp from "../../components/tools/reference.vue";
import type {ToolInterface} from "../models";
import {Tool} from "../models";
import {schema, uischema} from "../../schema/toolOptionsReference";
import type {ControlElement} from "@jsonforms/core/src/models/uischema";
import {resolveSchema, updatePropertyNameAndScope} from "../formbuilder";
import {useJsonforms} from "../../composable/jsonforms";


export const referenceTool = new Tool('Control','reference');
//referenceTool.toolType='reference';
referenceTool.tester =
    rankWith(1,
        and(
            uiTypeIs('Control'),
            (uischema, schema) => undefined !== schema?.$ref
        )
    );
referenceTool.importer = () => referenceComp;
referenceTool.optionJsonforms = async (tool) => {
    const definitionResolver = (ref:URI) => {
        if('referenceTool.definitions' === String(ref)) {
            const {schema:s} = useJsonforms();
            const definitionPaths = Object.keys(s.value?.definitions ?? []).map(key => '#/definitions/'+key);
            return {
                type: 'string',
                title: 'Select',
                enum: definitionPaths
            } as JsonSchema
        }
        return undefined;
    }
    return {
        schema:await resolveSchema(schema, definitionResolver),
        uischema:await resolveSchema(uischema),
    }
};

referenceTool.optionDataPrepare = (tool: ToolInterface) => {
    const data = {} as any;

    const schema = tool.schema as JsonSchema;

    data.propertyName = tool.propertyName;

    if (undefined !== schema.$ref) {
        data._reference = schema.$ref
    }

    return data;
};

referenceTool.optionDataUpdate = (tool: ToolInterface, data: any) => {
    const schema = tool.schema as JsonSchema;
    const uischema = tool.uischema as ControlElement;

    updatePropertyNameAndScope(data?.propertyName, tool)

    if (undefined !== data._reference) {
        schema.$ref = data._reference;
    }
};
