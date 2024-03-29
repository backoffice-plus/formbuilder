
<script setup lang="ts">
import {getFormbuilder, type ToolInterface} from "@/";

const props = defineProps<{
  tool: ToolInterface
  fb?: any //Formbuilder
}>()
const emit = defineEmits<{
  (e: 'confirm'): void,
  (e: 'unscope'): void,
}>()

const fb = props?.fb ?? getFormbuilder();
const hasSchemaParent = !!props.tool.edge.schemaParent;
const hasUiParent = !!props.tool.edge.uiParent;
const isUiBuilder = 'uischema' === fb?.exposed?.showBuilder?.value;
const isSchemaReadyOnly = fb.props.schemaReadOnly
const isControl = 'Control' === props.tool?.uischema?.type;

let unscopable = hasUiParent && hasSchemaParent && isUiBuilder;
let isDeletable = !(isControl && isSchemaReadyOnly)

//ScopeTool
if(isSchemaReadyOnly && !hasSchemaParent) {
  isDeletable = true;
}

const scopedChilds = props.tool.edge.findScopedChilds();

</script>

<template>
  <div class="p-4 shadow rounded">
    <h1 class="text-xl">
      Confirm deletion
    </h1>
    <p>Delete {{ isControl ? props.tool?.propertyName : props.tool?.uischema?.type }}</p>
    <slot />
    <div class="flex">
      <button class="mt-1 ml-auto px-2 border rounded-lg bg-yellow-500" @click="emit('unscope')" v-if="unscopable">
        <template v-if="isDeletable">just</template> unscope
      </button>
      <button class="mt-1 ml-auto px-2 border rounded-lg bg-red-500" @click="emit('confirm')" v-if="isDeletable">
        Confirm
      </button>
    </div>
    <div v-if="scopedChilds.length && !isControl">
      {{ scopedChilds.length }} Childs are only unscoped:
      <div v-for="child in scopedChilds">
        {{ child.propertyName }}
      </div>
    </div>
    <div v-if="tool.edge.childs.length && isControl && isDeletable">
      {{ tool.edge.childs.length }} Childs are deleted as well
    </div>
  </div>
</template>
