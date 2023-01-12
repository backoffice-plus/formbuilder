<template>
  <div class="labelTool">

    <ElementHeadOrToolIcon :isToolbar="isToolbar" :tool="tool" />

    <div v-if="!isToolbar">

        <Actions :tool="tool" @delete="onDelete" />

    </div>

  </div>
</template>


<style scoped>
.labelTool {
  @apply
  relative
}
</style>

<script>

import {
  ElementHeadOrToolIcon, Actions,
  ToolProps,
  updatableSchemaKeys, updatableUischemaKeys,
  emitter, buildModalOptions
} from "../../index";
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

  mounted() {
    if(!this.isToolbar) {
      const uischema = this.tool.props.jsonForms.uischema;
      if(undefined === uischema?.text) {
        uischema.text = 'Label'
      }
      uischema.label = uischema.text  ;
    }
  },

  data() {
    return {

    }
  },

  computed: {
    data() {
      return !this.isToolbar ? buildModalOptions(this.tool) : {};
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
