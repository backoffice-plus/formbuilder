<template>
  <div class="formInputByTypeTool" :class="['group/item']">

    <ElementHeadOrToolIcon :isToolbar="isToolbar" :tool="tool"/>

    <!--    <span class="font-mono text-xs" v-if="!tool">[{{ tool.uuid }}]</span>-->

    <div v-if="!isToolbar">

      <div>

        propertyName: {{ props.tool.props.propertyName }}

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
          <input :type="'number'" v-if="'number' === data.inputType" :step="data.type==='integer' ? 1 : 0.1"/>
          <input :type="data.inputType" v-else/>
        </template>

        <div>{{ data.description }}</div>
        <Actions :class="['opacity-0', 'group-hover/item:opacity-100']" :tool="tool" @delete="onDelete"/>

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

<script setup>

import Actions from "./utils/Actions.vue";
import ElementHeadOrToolIcon from "./utils/ElementHeadOrToolIcon.vue";
import {normalizeModalOptions} from '../../lib/normalizer'
import {computed} from 'vue';
import {Tool} from "../../lib/models";
import {useTemplateRefsList} from "@vueuse/core";

const props = defineProps({
  tool: Tool,
  isToolbar: Boolean,
  index: Number, //for deleting correct element in list

  isDragging: Boolean, //needed in flexarea
})

const emit = defineEmits(['deleteByIndex']);

defineExpose({ tool:props.tool })

const data = computed(() => {
  return !props.isToolbar ? normalizeModalOptions(props.tool) : {};
});

const onDelete = () => {
  if (confirm("Wirklich löschen?")) {
    emit('deleteByIndex', {index: props.index});
  }
};


</script>
