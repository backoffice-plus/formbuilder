import type {Ref} from 'vue'
import {ref} from 'vue'
import type {ToolInterface} from "../lib/tools";
import type {JsonSchema, UISchemaElement} from "@jsonforms/core";
import {generateJsonSchema} from "@jsonforms/core";
import {generateDefaultUISchema} from "@jsonforms/core/src/generators/uischema";
import {findBaseTool} from "../lib/formbuilder";

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

    return {
        baseTool,
        createBaseTool,
    };
}
