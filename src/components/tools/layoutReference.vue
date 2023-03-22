<template>
  <div class="layoutReferenceTool">

    <ToolIcon :tool="tool" :isToolbar="isToolbar">
      <template v-slot:droparea>
        <pre>{{ ref }}</pre>
      </template>
    </ToolIcon>

    <div v-if="!isToolbar" class="inline">

      <Actions :tool="tool" @delete="onDelete"/>

    </div>

  </div>
</template>

<style>
.layoutReferenceTool {
  min-height: auto !important;
  background-color: var(--tool-layout);
  @apply
  relative
}

.layoutReferenceTool pre {
  background-color: var(--tool-reference-ref);
  @apply
  inline p-0.5 px-2 rounded text-sm
}
</style>

<script setup>
import Actions from "./utils/Actions.vue";
import ToolIcon from "./utils/ToolIcon.vue";
import {computed} from "vue";

const props = defineProps({
  tool: Object,//ToolInterface,
  isToolbar: Boolean,
  index: Number, //for deleting correct element in list

  isInlineType: Boolean, //from arrayTool
})

const emit = defineEmits(['deleteByIndex']);


const ref = computed(() => {
  const ref = props.tool.uischema?.$ref;
  return ref && ref?.length ? ref : ' ';
})
//defineExpose({tool: props.tool})

const onDelete = () => {
  Promise.resolve(window.confirm("Wirklich löschen?"))
      .then((confirmed) => {
        if(confirmed) {
          emit("deleteByIndex", { index: props.index });
        }
      });
};
</script>
