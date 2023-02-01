<template>
  <div class="htmlTool">

    HTML

    <div v-if="!isToolbar">

        <Actions :tool="tool" @delete="onDelete" />

    </div>

  </div>
</template>

<style>
.htmlTool {
  @apply
  bg-yellow-100 !important
}
</style>

<style scoped>
.htmlTool {
  min-height:auto;
  @apply
  relative
}
</style>

<script setup>

import Actions from "../../src/components/tools/utils/Actions.vue";
import ElementHeadOrToolIcon from "../../src/components/tools/utils/ElementHeadOrToolIcon.vue";
import {Tool} from "../../src/index";

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
