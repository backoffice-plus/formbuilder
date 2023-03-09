import {ref, unref} from 'vue'
import type {Ref} from 'vue'
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
import type {JsonSchema} from "@jsonforms/core";



export type builderTypes = 'schema' | 'uischema' | 'definitions';

const builder: Ref<builderTypes> = ref('uischema');



export function useFormbuilder() {

    return {
        builder,
    };
}
