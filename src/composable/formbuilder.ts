import {ref, unref} from 'vue'
import type {Ref} from 'vue'
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
import type {JsonSchema} from "@jsonforms/core";
import type {ToolInterface} from "../lib/tools";

export type builderTypes = 'schema' | 'uischema' | 'definitions';

const builder: Ref<builderTypes> = ref('uischema');
const schemaReadOnly: Ref<Boolean> = ref(false);
const toolDragging: Ref<ToolInterface|undefined> = ref();

export function useFormbuilder() {

    const onDrag = (e:any) => {
        const isDragging = 'start' === e?.type;
        const tool = e?.item?._underlying_vm_;

        toolDragging.value = isDragging && tool ? tool : undefined;
    };

    return {
        builder,
        schemaReadOnly,
        toolDragging,
        onDrag,
    };
}
