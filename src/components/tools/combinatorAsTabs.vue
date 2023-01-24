<template>
  <div class="labelTool">

    <ElementHeadOrToolIcon :isToolbar="isToolbar" :tool="tool" />

    <div v-if="!isToolbar">

        <Actions :tool="tool" @delete="onDelete" />

      <textarea class="w-full h-32 bg-black text-white font-mono text-xs" disabled>{{ items }}</textarea>

    </div>

  </div>
</template>


<style scoped>
.labelTool {
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
    },
    keyword() {
      let keyword = undefined;
      ['oneOf', 'anyOf', 'allOf'].forEach(key => {
        if(undefined !== this.tool.props.jsonForms.schema[key]) {
          keyword = key;
        }
      })
      return keyword;
    },
    items() {
      return this.tool.props.jsonForms.schema[this.keyword] ?? [];
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
