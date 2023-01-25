<template>
  <div class="combinatorTool">

    <ElementHeadOrToolIcon :isToolbar="isToolbar" :tool="tool" />

    <div v-if="!isToolbar">

        <Actions :tool="tool" @delete="onDelete" />

      REF: {{ tool.props.jsonForms.schema?.$ref }}

    </div>

  </div>
</template>


<style scoped>
.combinatorTool {
  min-height:auto;
  @apply
  relative
}
</style>

<script setup>

import {
  ElementHeadOrToolIcon, Actions,
} from "../../index";
import {normalizeModalOptions} from '../../lib/normalizer'
import {computed} from 'vue';
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
