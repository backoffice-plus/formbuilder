<template>
  <div class="unknownTool">

    UNKNOWN {{ tool.props.propertyName }}

    {{ tool.props?.jsonForms?.schema }}

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

import {Tool} from "../../lib/models";

const props = defineProps({
  tool: Tool,
  isToolbar: Boolean,
  index: Number, //for deleting correct element in list

  isDragging: Boolean, //needed in flexarea
})

defineExpose({ tool:props.tool })

</script>
