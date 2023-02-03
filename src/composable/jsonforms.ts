import {ref, unref} from 'vue'
import type {Ref} from 'vue'
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
import type {JsonSchema} from "@jsonforms/core";

const schema: Ref<JsonSchema> = ref({});
const uischema: Ref<UISchemaElement> = ref({type:''});

export function useJsonforms() {

    const update = (updateSchema: JsonSchema, updateUiSchema: UISchemaElement): void => {
        schema.value = updateSchema;
        uischema.value = updateUiSchema;
    };

    const updateUiSchema = (update: UISchemaElement): void => {
        uischema.value = update;
    };

    return {
        schema,
        uischema,
        update,
        updateUiSchema
    };
}
