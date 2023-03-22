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
  background-color: var(--tool-error);
  @apply
  relative
}
</style>

<script setup>

import Actions from "./utils/Actions.vue";

const props = defineProps({
  tool: Object,//ToolInterface,
  isToolbar: Boolean,
})

const emit = defineEmits(['deleteByTool']);

//defineExpose({ tool:props.tool })

const onDelete = () => {
  emit("deleteByTool", { tool: props.tool });
};

</script>
