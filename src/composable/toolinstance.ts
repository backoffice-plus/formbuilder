import type {Ref} from 'vue'
import {ref} from 'vue'
import type {ToolInterface} from "../lib/tools";
import type {JsonSchema, UISchemaElement} from "@jsonforms/core";
import {generateJsonSchema} from "@jsonforms/core";
import {generateDefaultUISchema} from "@jsonforms/core/src/generators/uischema";
import {cloneToolWithSchema, findBaseTool} from "../lib/formbuilder";
import {objectTool} from "../lib/tools/ObjectTool";

const baseTool: Ref<ToolInterface | null> = ref(null);

export function useToolInstance() {

    const createBaseTool = (schema: JsonSchema, uischema: UISchemaElement) => {
        if (undefined === schema) {
            schema = generateJsonSchema({});
        }
        if (undefined === uischema) {
            uischema = generateDefaultUISchema(schema);
        }

        baseTool.value = findBaseTool(schema, uischema);

        return baseTool;
    };

    const createSchemaTool = (schema: JsonSchema) => {
        const tool = cloneToolWithSchema(objectTool, schema);
        tool.propertyName = 'schema';

        return tool;
    }
    const createDefTool = (schema: JsonSchema) => {
        const defSchema = {
            type:'object',
            properties: schema.definitions
        } as JsonSchema;

        const tool = cloneToolWithSchema(objectTool, defSchema);
        tool.propertyName = 'definitions';

        return tool;
    }

    return {
        baseTool,
        createBaseTool,
        createSchemaTool,
        createDefTool,
    };
}
