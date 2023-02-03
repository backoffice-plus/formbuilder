<template>

  <vuedraggable
    tag="aside"
    :list="tools"
    :group="{name:'formBuilder', pull: 'clone', put: false}"
    :clone="cloneEmptyTool"
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
  @apply
  flex space-x-2
  w-full
  bg-gray-200
  rounded
  p-2

  overflow-x-auto
}

aside::-webkit-scrollbar {
  width: 4px;
}
aside::-webkit-scrollbar-track {
  @apply bg-gray-200
}
aside::-webkit-scrollbar-thumb {
  border-width: 6px;
  @apply
  rounded-full
  border-solid border-gray-200
  bg-gray-500
  hover:bg-opacity-80
  active:bg-opacity-50
}

aside .toolItem {
  min-width: 80px;
  @apply
  cursor-move

  h-10 w-20

  overflow-hidden

  bg-blue-100

  bg-opacity-100
  hover:bg-opacity-80

  border border-gray-500

  rounded
  shadow

  flex items-center justify-center

  text-xs leading-none text-center
}
aside .toolItem.formInputByTypeTool {
   @apply
  bg-blue-200
}

</style>


<script setup>

/**
 * @see https://sortablejs.github.io/vue.draggable.next/#/clone-on-control
 */

import {computed, ref} from 'vue';
import Vuedraggable from 'vuedraggable'
import {findAllProperties, findAllScopes, cloneEmptyTool,} from "../index";
import {guessInputType, normalizeScope, normalizePath} from '../lib/normalizer'
import {useTools} from "../composable/tools";
import {useJsonforms} from "../composable/jsonforms";
import formInputByType from "../components/tools/formInputByType.vue";

const props = defineProps(
    {
      schemaReadOnly: {type:Boolean, default: false},
      jsonForms: {type:Object, default: {}},
    }
);

const emits = defineEmits(['drag']);


const {getControlTools, getLayoutTools, findMatchingTool} = useTools();
const {schema, uischema} = useJsonforms();

const drag = ref(false);
const cloneCounter = ref({});

const usedProps = computed(() => findAllScopes(uischema.value).map(scope=>normalizePath(normalizeScope(scope))));

const tools = computed(() => {

  let all = [...getLayoutTools()];

  //:TODO find better solution!! use toolStore
  if(props.schemaReadOnly) {
    const allProps = findAllProperties(schema.value);
    const readOnlyControlTools = Object.keys(allProps)?.map(name => {

      const itemSchema = allProps[name];

      const clone = cloneTool(findMatchingTool(schema, itemSchema, {type:'Control'}))
      clone.schema = itemSchema;
      clone.propertyName = name;
      clone.schemaReadOnly = true;

      return clone;
    }).filter(tool => !usedProps.value.includes(tool.propertyName))

    all = [...readOnlyControlTools, ...all]
  }
  else {
    all = [...getControlTools(), ...all]
  }

  //:TODO add property to tool to hide tools
  all = all.filter(tool => tool.uischemyType !== 'Category');

  return all;
});


const onDrag = (drag) => {
  emits('drag', drag);
};


</script>
