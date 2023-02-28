<template>
  <div class="constTool">
    <ToolIcon :tool="tool" :isToolbar="isToolbar">

      <template v-slot:droparea>
        <label class="font-bold">{{ tool.propertyName }}</label>
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

const props = defineProps({
  tool: Object,//ToolInterface,
  isToolbar: Boolean,
  index: Number, //for deleting correct element in list

  isDragging: Boolean, //needed in flexarea
})

let constValue = props.tool.schema.const;
if(null === constValue) {
  constValue = 'null';
}

const emit = defineEmits(['deleteByIndex']);

//defineExpose({tool: props.tool})

const onDelete = () => {
  Promise.resolve(window.confirm("Wirklich löschen?"))
      .then((confirmed) => {
        if(confirmed) {
          emit("deleteByIndex", { index: props.index });
        }
      });
};

</script>
