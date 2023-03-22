<template>
  <div class="constTool">
    <ToolIcon :tool="tool" :isToolbar="isToolbar">

      <template v-slot:droparea>
        <label class="font-bold">{{ tool.propertyName }}</label>
        <span>{{ tool.uischema.label ?? tool.schema.title }}</span>
        {{ constValue }}
      </template>

    </ToolIcon>

    <div v-if="!isToolbar">

      <Actions :tool="tool" @delete="onDelete"/>

    </div>

  </div>
</template>


<style scoped>
.constTool {
  min-height: auto !important;
  background-color: var(--tool-control);
  @apply
  relative
}
</style>

<script setup>
import Actions from "./utils/Actions.vue";
import ToolIcon from "./utils/ToolIcon.vue";
import {computed} from "vue";
import {toolComponentProps} from "../../lib/models";

const props = defineProps({...toolComponentProps()})

let constValue = computed(() => props.tool.schema.const);
if(null === constValue.value) {
  constValue.value = 'null';
}

const emit = defineEmits(['deleteByTool']);

//defineExpose({tool: props.tool})

const onDelete = () => {
  emit("deleteByTool", { tool: props.tool });
};

</script>
