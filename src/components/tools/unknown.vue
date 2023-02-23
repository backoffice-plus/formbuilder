<template>
  <div class="unknownTool">

    UNKNOWN {{ tool.propertyName }}


    <div v-if="!isToolbar">

      <Actions :tool="tool" @delete="onDelete" />

      <pre>{{ tool.schema }}</pre>
    </div>

  </div>
</template>


<style scoped>
.unknownTool {
  min-height:auto;
  @apply
  relative bg-red-100
}
</style>

<script setup>

import Actions from "./utils/Actions.vue";

const props = defineProps({
  tool: Object,//ToolInterface,
  isToolbar: Boolean,
  index: Number, //for deleting correct element in list

  isDragging: Boolean, //needed in flexarea
})

const emit = defineEmits(['deleteByIndex']);

defineExpose({ tool:props.tool })

const onDelete = () => {
  Promise.resolve(window.confirm("Wirklich löschen?"))
      .then((confirmed) => {
        if(confirmed) {
          emit("deleteByIndex", { index: props.index });
        }
      });
};

</script>
