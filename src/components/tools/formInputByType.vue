<template>
  <div class="formInputByTypeTool" :class="['group/item']">

    <ElementHeadOrToolIcon :isToolbar="isToolbar" :tool="tool" />

<!--    <span class="font-mono text-xs" v-if="!tool">[{{ tool.uuid }}]</span>-->

    <div v-if="!isToolbar">

      <div>

        <template v-if="'select' === data.inputType">
          <select>
            <option v-for="item in data.enum" v-if="data.enum">{{ item }}</option>
            <option v-for="item in data.oneOf" v-else-if="data.oneOf">{{ item }}</option>
          </select>
        </template>


<!--        <template v-else-if="'radio' === data.inputType">-->
<!--          <div class="flex flex-row space-x-4">-->
<!--            <span v-for="item in data.enum">-->
<!--              <input name="propertyName" :type="data.inputType"/> {{ item }}-->
<!--            </span>-->
<!--          </div>-->
<!--        </template>-->

        <template v-else-if="'textarea' === data.inputType">
          <textarea></textarea>
        </template>

        <template v-else>
          <input :type="'number'" v-if="'number' === data.inputType" :step="data.type==='integer' ? 1 : 0.1" />
          <input :type="data.inputType" v-else />
        </template>

        <div>{{ data.description }}</div>
        <Actions  :class="['opacity-0', 'group-hover/item:opacity-100']" :tool="tool" @delete="onDelete" />

      </div>

    </div>

  </div>
</template>


<style scoped>
input:not([type="checkbox"]),
textarea,
select {
  @apply
  w-full
}
.formInputByTypeTool {
  @apply
  relative
  h-full
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
