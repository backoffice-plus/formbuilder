<template>
  <div class="referenceTool">

    <ToolIcon :tool="tool" :isToolbar="isToolbar">
      <template v-slot:droparea>
        <!-- TODO: there is no propName in: anyOf[{$ref:'...}] -->
        <template v-if="!isInlineType">
          <b>{{ tool.propertyName }}</b>
        </template>

        <pre class="bg-base-100 inline p-0.5 px-2 rounded text-sm">{{ props.tool.schema?.$ref ?? ' ' }}</pre>
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
</style>

<script setup>
import Actions from "./utils/Actions.vue";
import ToolIcon from "./utils/ToolIcon.vue";

const props = defineProps({
  tool: Object,//ToolInterface,
  isToolbar: Boolean,
  index: Number, //for deleting correct element in list

  isDragging: Boolean, //needed in flexarea
  isInlineType: Boolean, //from arrayTool
})

const emit = defineEmits(['deleteByIndex']);

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
