<template>
  <div class="referenceTool">

    <ElementHeadOrToolIcon :isToolbar="isToolbar" :tool="tool" />

    <div v-if="!isToolbar">

        <Actions :tool="tool" @delete="onDelete" />

      <pre class="bg-gray-200 inline p-0.5 px-2 rounded text-sm">{{ props.tool.props.jsonForms.schema?.$ref }}</pre>

    </div>

  </div>
</template>


<style scoped>
.referenceTool {
  min-height:auto;
  @apply
  relative
}
</style>

<script setup>

import Actions from "./utils/Actions.vue";
import ElementHeadOrToolIcon from "./utils/ElementHeadOrToolIcon.vue";
import {Tool} from "../../lib/models";

const props = defineProps({
  tool: Tool,
  isToolbar: Boolean,
  index: Number, //for deleting correct element in list

  isDragging: Boolean, //needed in flexarea
})

const emit = defineEmits(['deleteByIndex']);

defineExpose({ tool:props.tool })

const onDelete = () => {
  if (confirm("Wirklich löschen?")) {
    emit('deleteByIndex', {index: props.index});
  }
};
</script>
