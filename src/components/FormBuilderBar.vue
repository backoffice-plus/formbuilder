<template>

  <Vuedraggable
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

  </Vuedraggable>

</template>

<style scoped>

aside {
  background-color: var(--toolBar);

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
  background-color: var(--toolBar);
}
aside::-webkit-scrollbar-thumb {
  background-color: var(--toolBar-scrollbar);
  border-color: var(--toolBar);

  border-width: 6px;
  @apply
  rounded-full
  border-solid
  /* :TODO hover color */
}

aside .toolItem {

  border-color: var(--toolItem-border);

  @apply
  cursor-move

  h-10
  px-4

  overflow-hidden

  border

  rounded
  shadow

  flex items-center justify-center

  text-xs leading-none text-center
}

</style>


<script setup>
import {ref} from 'vue';
import {Vuedraggable} from "@/"
import {getFormbuilder, getToolDraggingRef, cloneEmptyTool} from "@/";

/**
 * @see https://sortablejs.github.io/vue.draggable.next/#/clone-on-control
 */

const props = defineProps(
    {
      tools: {type:Array, default: []},
    }
);

const fb = getFormbuilder();
const toolDragging = getToolDraggingRef();

const emits = defineEmits(['drag']);

const drag = ref(false);
const currentTool = ref();

const onDrag = (drag) => {
  toolDragging.value = drag ? currentTool.value : undefined;
  emits('drag', drag);
};

const onClone = (tool) => {

  const isControl = 'Control' === tool.uischema.type;
  const isUnscoped = !!tool.edge.schemaParent;  //unscoped tools from existing scheme
  const isSchemaReadOnly = fb.props.schemaReadOnly;

  const context = {
    fb:fb,
    parentMethod:'formbuilderbar.onclone',
    builder: fb?.exposed?.showBuilder?.value,
    schemaReadOnly: fb.props.schemaReadOnly,
  };

  let isCloneable = !(isControl && (isSchemaReadOnly || isUnscoped))

  /**
   * Eventhandler per Tool
   * :TODO finalize it -> move logic from here to each tool (or abstract tool)
   */
  if(tool.handelOnClone) {
    const e = {isCloneable, context}
    tool.handelOnClone(e);
    "isCloneable" in e && (isCloneable = e.isCloneable);
  }

  if(!isCloneable) {
    tool.optionDataUpdate(context, tool.optionDataPrepare(context));

    if(isUnscoped) {
        tool.edge.wasUnscoped = true;
    }
    return tool;
  }

  currentTool.value = tool;

  //return props.schemaReadOnly ? tool : cloneEmptyTool(tool);
  return cloneEmptyTool(tool)
}

// const onStart = (e) => {
//   console.log("onStart",e)
//   e.pullMode='formBuilderArray'
//   onDrag(true)
// };

</script>

