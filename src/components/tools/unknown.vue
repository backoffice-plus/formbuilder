<template>
  <div class="unknownTool">

    UNKNOWN {{ tool.propertyName }}

    {{ tool.schema }}

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

import {AbstractTool, Tool} from "../../lib/models";

const props = defineProps({
  tool: Object,//ToolInterface,
  isToolbar: Boolean,
  index: Number, //for deleting correct element in list

  isDragging: Boolean, //needed in flexarea
})

defineExpose({ tool:props.tool })

</script>
