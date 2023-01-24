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

<script>

import {
  ElementHeadOrToolIcon, Actions,
  ToolProps,
  updatableSchemaKeys, updatableUischemaKeys,
  emitter
} from "../../index";
import {normalizeModalOptions} from "../../lib/normalizer";
import {defineComponent} from 'vue';
import {Tool} from "../../lib/models";

export default defineComponent({
  components: {ElementHeadOrToolIcon, Actions},
  props: {
    tool: Tool,
    isToolbar: Boolean,
    index: Number, //for deleting correct element in list

    isDragging: Boolean, //needed in flexarea
  },

  data() {
    return {

    }
  },
});
</script>
