<template>
  <div class="referenceTool">

    <ElementHeadOrToolIcon :isToolbar="isToolbar" :tool="tool" />

    <div v-if="!isToolbar">

        <Actions :tool="tool" @delete="onDelete" />

      <pre class="bg-gray-200 inline p-0.5 px-2 rounded text-sm">{{ tool.props.jsonForms.schema?.$ref }}</pre>

    </div>

  </div>
</template>


<style scoped>
.referenceTool {
  min-height:auto;
  @apply
  relative
}
</style>

<script>

import {
  ElementHeadOrToolIcon, Actions,
  ToolProps,
  updatableSchemaKeys, updatableUischemaKeys,
  emitter
} from "../../index";
import {normalizeModalOptions} from '../../lib/normalizer'
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

  computed: {
    data() {
      return !this.isToolbar ? normalizeModalOptions(this.tool) : {};
    }
  },

  methods: {
    onDelete() {
      if(confirm("Wirklich löschen?")) {
        this.$emit('deleteByIndex', {index: this.index});
      }
    },
  }
});
</script>
