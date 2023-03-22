<template>
  <div class="formInputByTypeTool" >

    <ToolIcon :tool="tool" :isToolbar="isToolbar">
      <template v-slot:droparea>
        <template v-if="isInlineType">
          Type: {{ schema.type }}
        </template>
        <template v-else>
          <label class="font-bold">{{ tool.propertyName }}</label>
          {{ tool.uischema?.label ?? tool.schema?.title }}
        </template>
      </template>
    </ToolIcon>

    <div v-if="!isToolbar">

      <Actions :tool="tool" @delete="onDelete"/>

      <div>

        <template v-if="'select' === inputType">
          <select v-if="selectItems">
            <option v-for="item in selectItems">{{ item }}</option>
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
          <input :type="inputType" v-else :placeholder="uischema.options?.placeholder"/>
        </template>

        <div>{{ schema.description }}</div>

      </div>

    </div>

  </div>
</template>


<style scoped>
input:not([type="checkbox"]),
textarea,
select {
  background-color: var(--tool-control-input);
  border-color: var(--tool-control-input-border);
  @apply
  w-full
}

.formInputByTypeTool {
  background-color: var(--tool-control);
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
import {toolComponentProps} from "../../lib/models";

const props = defineProps({...toolComponentProps()})

const emit = defineEmits(['deleteByTool']);

//defineExpose({tool: props.tool})

const schema = props.tool.schema;
const uischema = props.tool.uischema;
const inputType = computed(() => guessInputType(props.tool.schema, props.tool.uischema));

const selectItems = computed(() => {
  const enumOrOneOf = props.tool.schema?.items ?? props.tool.schema;
  return enumOrOneOf?.enum ?? enumOrOneOf?.oneOf.map(item => item?.title ?? item?.const ?? '??');
});

const onDelete = () => {
  emit("deleteByTool", { tool: props.tool });
};


</script>
