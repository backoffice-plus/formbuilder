<template>

  <vuedraggable
    tag="aside"
    :list="tools"
    :group="{name:'formBuilder', pull: 'clone', put: false}"
    :clone="onClone"
    :sort="false"
    drag-class="dragging"
    @choose="() => {}"
    @start="onDrag(true)"
    @end="onDrag(false)"
    item-key="uuid"
  >
    <template #item="{ element: tool }">
      <component :is="tool.importer()"

                 :tool="tool"
                 :isToolbar="true"

                 class="toolItem"
      />
    </template>

  </vuedraggable>

</template>

<style scoped>

aside {
  background-color: var(--base-100);

  @apply
  flex space-x-2
  w-full

  rounded
  p-2

  overflow-x-auto
}

aside::-webkit-scrollbar {
  width: 4px;
}
aside::-webkit-scrollbar-track {
  background-color: var(--base-100);
}
aside::-webkit-scrollbar-thumb {
  background-color: var(--base-200);
  border-color: var(--base-100);

  border-width: 6px;
  @apply
  rounded-full
  border-solid
  /* :TODO hover color */
  /*hover:bg-opacity-80*/
  /*active:bg-opacity-50*/
}

aside .toolItem {
  min-width: 80px;

  border-color: var(--base-200);

  @apply
  cursor-move

  h-10 w-20

  overflow-hidden

  /*bg-blue-100*/

  /*bg-opacity-100*/
  /*hover:bg-opacity-80*/

  border

  rounded
  shadow

  flex items-center justify-center

  text-xs leading-none text-center
}
/*aside .toolItem.formInputByTypeTool {*/
/*   @apply*/
/*  bg-blue-200*/
/*}*/

</style>


<script setup>

/**
 * @see https://sortablejs.github.io/vue.draggable.next/#/clone-on-control
 */

import {ref} from 'vue';
import {Vuedraggable} from '../index'
import {cloneEmptyTool, cloneToolWithSchema} from "../index";


const props = defineProps(
    {
      schemaReadOnly: {type:Boolean, default: false},
      jsonForms: {type:Object, default: {}},
      tools: {type:Array, default: []},
    }
);

const emits = defineEmits(['drag']);

const drag = ref(false);

const onDrag = (drag) => {
  emits('drag', drag);
};

const onClone = (tool) => {
  if(props.schemaReadOnly) {
    tool.optionDataUpdate(tool, tool.optionDataPrepare(tool));

    return tool;
  }
  //return props.schemaReadOnly ? tool : cloneEmptyTool(tool);
  return cloneEmptyTool(tool)
}

// const onStart = (e) => {
//   console.log("onStart",e)
//   e.pullMode='formBuilderArray'
//   onDrag(true)
// };

</script>

