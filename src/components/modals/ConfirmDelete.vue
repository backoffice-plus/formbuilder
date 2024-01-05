
<script setup lang="ts">
import type {ToolInterface} from "../../lib/models";
import {getFormbuilder} from "../../lib/vue";

const props = defineProps<{
  tool: ToolInterface
  fb?: any //Formbuilder
}>()
const emit = defineEmits<{
  (e: 'confirm'): void,
  (e: 'unscope'): void,
}>()

const fb = props?.fb ?? getFormbuilder();
const hasSchemaParent = props.tool.edge.schemaParent;
const hasUiParent = props.tool.edge.uiParent;
const isUiBuilder = 'uischema' === fb?.exposed?.showBuilder?.value;

const unscopable = hasUiParent && hasSchemaParent && isUiBuilder;

const isControl = 'Control' === props.tool?.uischema?.type;
const scopedChilds = props.tool.edge.findScopedChilds();

</script>

<template>
  <div class="p-4 shadow rounded">
    <h1 class="text-xl">
      Confirm deletion
    </h1>
    <p>Delete {{ isControl ? props.tool?.propertyName : "???"}}</p>
    <slot />
    <div class="flex">
      <button class="mt-1 ml-auto px-2 border rounded-lg bg-yellow-500" @click="emit('unscope')" v-if="unscopable">
        just unscope
      </button>
      <button class="mt-1 ml-auto px-2 border rounded-lg bg-red-500" @click="emit('confirm')">
        Confirm
      </button>
    </div>
    <div v-if="scopedChilds.length && !isControl">
      {{ scopedChilds.length }} Childs are only unscoped:
      <div v-for="child in scopedChilds">
        {{ child.propertyName }}
      </div>
    </div>
    <div v-if="tool.edge.childs.length && isControl">
      {{ tool.edge.childs.length }} Childs are deleted as well
    </div>
  </div>
</template>
