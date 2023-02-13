<template>
  <div class="formInputByTypeTool" :class="['group/item']">

    <ToolIcon :tool="tool" :isToolbar="isToolbar">
      <template v-slot:droparea>
        <template v-if="isInlineType">
          Type: {{ schema.type }}
        </template>
        <template v-else>
          <label class="font-bold">{{ tool.propertyName }}</label>
          {{ tool.uischema?.label }}
        </template>
      </template>
    </ToolIcon>

    <div v-if="!isToolbar">

      <div>

        <template v-if="'select' === inputType">
          <select>
            <option v-for="item in schema.enum" v-if="schema.enum">{{ item }}</option>
            <option v-for="item in schema.oneOf" v-else-if="schema.oneOf">{{ item }}</option>
          </select>
        </template>


        <!--        <template v-else-if="'radio' === data.inputType">-->
        <!--          <div class="flex flex-row space-x-4">-->
        <!--            <span v-for="item in data.enum">-->
        <!--              <input name="propertyName" :type="data.inputType"/> {{ item }}-->
        <!--            </span>-->
        <!--          </div>-->
        <!--        </template>-->

        <template v-else-if="'textarea' === inputType">
          <textarea></textarea>
        </template>

        <template v-else>
          <input :type="'number'" v-if="'number' === inputType" :step="schema.type==='integer' ? 1 : 0.1"/>
          <input :type="inputType" v-else/>
        </template>

        <div>{{ schema.description }}</div>
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
import {guessInputType} from '../../lib/normalizer'
import {computed} from 'vue';
import ToolIcon from "./utils/ToolIcon.vue";

const props = defineProps({
  tool: Object,//ToolInterface,
  isToolbar: Boolean,
  index: Number, //for deleting correct element in list

  isDragging: Boolean, //needed in flexarea
  isInlineType: Boolean, //from arrayTool
})

const emit = defineEmits(['deleteByIndex']);

defineExpose({tool: props.tool})

const schema = props.tool.schema;
const uischema = props.tool.uischema;
const inputType = computed(() => guessInputType(props.tool.schema, props.tool.uischema));

const onDelete = () => {
  if (confirm("Wirklich löschen?")) {
    emit('deleteByIndex', {index: props.index});
  }
};


</script>
