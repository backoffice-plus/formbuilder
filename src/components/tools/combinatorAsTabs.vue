<template>
  <div class="labelTool">

    <ElementHeadOrToolIcon :isToolbar="isToolbar" :tool="tool"/>

    <div v-if="!isToolbar">

      <Actions :tool="tool" @delete="onDelete"/>

      <textarea class="w-full h-32 bg-black text-white font-mono text-xs" disabled>{{ items }}</textarea>

    </div>

  </div>
</template>


<style scoped>
.labelTool {
  min-height: auto;
  @apply
  relative
}
</style>

<script setup>

import Actions from "./utils/Actions.vue";
import ElementHeadOrToolIcon from "./utils/ElementHeadOrToolIcon.vue";
import {computed} from 'vue';
import {AbstractTool, Tool} from "../../lib/models";

const props = defineProps({
  tool: Object,//ToolInterface,
  isToolbar: Boolean,
  index: Number, //for deleting correct element in list

  isDragging: Boolean, //needed in flexarea
})

const emit = defineEmits(['deleteByIndex']);

defineExpose({ tool:props.tool })

const keyword = computed(() => {
  let keyword = undefined;
  ['oneOf', 'anyOf', 'allOf'].forEach(key => {
    if (undefined !== props.schema[key]) {
      keyword = key;
    }
  })
  return keyword;
});

const items = computed(() => {
  return props.tool.schema[keyword] ?? [];
});

const onDelete = () => {
  if (confirm("Wirklich löschen?")) {
    emit('deleteByIndex', {index: props.index});
  }
};

</script>
