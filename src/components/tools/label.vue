<template>
  <div class="labelTool">
    <ToolIcon :tool="tool" :isToolbar="isToolbar">
      <template v-slot:droparea>
        {{ tool.uischema.text }}
        <SchemaFeatures :tool="tool" />
      </template>
    </ToolIcon>

    <div v-if="!isToolbar">

      <Actions :tool="tool" @delete="onDelete"/>

    </div>

  </div>
</template>


<style scoped>
.labelTool {
  background-color: var(--tool-accent);
  min-height: auto !important;
  @apply
  relative
}
</style>

<script setup>
import Actions from "./utils/Actions.vue";
import ToolIcon from "./utils/ToolIcon.vue";
import {toolComponentProps} from "../../lib/models";
import SchemaFeatures from "./utils/SchemaFeatures.vue";

const props = defineProps({...toolComponentProps()})

const emit = defineEmits(['deleteByTool']);

//defineExpose({tool: props.tool})

const onDelete = () => {
  emit("deleteByTool", { tool: props.tool });
};

</script>
