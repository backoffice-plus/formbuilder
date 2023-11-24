<template>
  <div class="buttonTool" :class="['rootItem', {isRoot:isRoot}]">

    <slot name="header">
      <ToolIcon :tool="tool" :isToolbar="isToolbar">
        <template v-slot:droparea>
          <pre>{{ button }}</pre>
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
.buttonTool {
  background-color: var(--tool-accent);
  min-height: auto !important;
  @apply
  relative
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


const button = computed(() => {
  const button = props.tool.uischema?.button;
  return button && button?.length ? button : ' ';
})
//defineExpose({tool: props.tool})

const onDelete = () => {
  emit("deleteByTool", { tool: props.tool });
};
</script>
