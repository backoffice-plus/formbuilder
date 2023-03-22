<template>
  <div class="referenceTool">

    <ToolIcon :tool="tool" :isToolbar="isToolbar">
      <template v-slot:droparea>
        <!-- TODO: there is no propName in: anyOf[{$ref:'...}] -->
        <template v-if="!isInlineType">
          <b>{{ tool.propertyName }}</b>
        </template>

        <pre>{{ ref }}</pre>
      </template>
    </ToolIcon>

    <div v-if="!isToolbar" class="inline">

      <Actions :tool="tool" @delete="onDelete"/>

    </div>

  </div>
</template>

<style>
.referenceTool {
  min-height: auto !important;
  background-color: var(--tool-control);
  @apply
  relative
}

.referenceTool pre {
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
  isInlineType: Boolean, //from arrayTool
})

const emit = defineEmits(['deleteByTool']);


const ref = computed(() => {
  const ref = props.tool.schema?.$ref;
  return ref && ref?.length ? ref : ' ';
})
//defineExpose({tool: props.tool})

const onDelete = () => {
  emit("deleteByTool", { tool: props.tool });
};
</script>
