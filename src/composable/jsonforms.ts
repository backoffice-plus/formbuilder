import {ref} from 'vue'
import type {Ref} from 'vue'
import type {JsonFormsSchema, JsonFormsUISchema} from "../lib/models";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";

const schema: Ref<JsonFormsSchema> = ref({});
const uischema: Ref<UISchemaElement> = ref({type:''});

export function useJsonforms() {

    const update = (updateSchema: JsonFormsSchema, updateUiSchema: UISchemaElement): void => {
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
