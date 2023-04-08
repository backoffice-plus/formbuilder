<template>
  <div class="scopeTool" :class="['rootItem', {isRoot:isRoot}]">

    <slot name="header">
      <ToolIcon :tool="tool" :isToolbar="isToolbar">
        <template v-slot:droparea>
          <pre>{{ scope }}</pre>
          <SchemaFeatures :tool="tool" />
        </template>
      </ToolIcon>
    </slot>

    <div v-if="!isToolbar" :class="[{'mr-5':!isRoot}]">

      <Actions :tool="tool" @delete="onDelete" :deletable="!isRoot"/>

    </div>

  </div>
</template>

<style>
.scopeTool {
  min-height: auto !important;
  @apply
  relative
}
.scopeTool:not(.isRoot) {
  background-color: var(--tool-layout);
}

.scopeTool pre {
  background-color: var(--tool-reference-ref);
  @apply
  inline p-0.5 px-2 rounded text-sm
}
</style>

<script setup>
import Actions from "./utils/Actions.vue";
import ToolIcon from "./utils/ToolIcon.vue";
import {computed} from "vue";
import {toolComponentProps} from "../../lib/models";
import SchemaFeatures from "./utils/SchemaFeatures.vue";

const props = defineProps({...toolComponentProps()})

const emit = defineEmits(['deleteByTool']);


const scope = computed(() => {
  const scope = props.tool.uischema?.scope;
  return scope && scope?.length ? scope : ' ';
})
//defineExpose({tool: props.tool})

const onDelete = () => {
  emit("deleteByTool", { tool: props.tool });
};
</script>
