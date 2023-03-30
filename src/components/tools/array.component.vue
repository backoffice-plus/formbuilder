<template>
  <div class="arrayTool rootItem" :class={isInlineType:isInlineType,isRoot:isRoot} :title="toolOptions.title">

    <ToolIcon :tool="tool" :isToolbar="isToolbar">
      <template v-slot:droparea>
        <b>{{ tool.propertyName }}:</b> Array
        <span v-if="getFirstChildItemsType"> of {{ getFirstChildItemsType }}</span>
        <span v-else-if="isArrayOfRef"> of Ref</span>
        <span v-else-if="isArrayOfCombinator"> of {{ isArrayOfCombinator }}</span>
      </template>

    </ToolIcon>

    <div v-if="!isToolbar" :class="[{'mr-5':!isRoot}]">

      <Actions :tool="tool" @delete="onDelete" :deletable="!isRoot">
        <button type="button" @click="() => addItem()" v-if="showAddItem"><Icon icon="mdi:plus" /></button>
        <button type="button" @click="collapsed=!collapsed;" v-if="!isRoot"><Icon :icon="collapsed ? 'mdi:arrow-expand-vertical' : 'mdi:arrow-collapse-vertical'" /></button>
      </Actions>

<!--      <div class="tabs">-->
<!--        <div class="flex items-center">-->
<!--        </div>-->
<!--      </div>-->

      <Vuedraggable
          v-bind="vuedraggableOptions"

          :class="['dropArea nestedFlexArea flex-col', {drag:showDragClass}]"
          :list="childTools"
          :group="{name:'formBuilder', pull: true, put: groupPut}"
          @start="onDrag"
          @end="onDrag"
          @change="onDropAreaChange"

          v-show="!collapsed"
      >
        <template #item="{ element: tool, index }">
          <div> <!-- div needed for edit mode?!?! -->
            <component :is="tool.importer()"

                       :tool="tool"
                       :isToolbar="false"
                       :isInlineType="isInlineType || isArrayOfRef || isArrayOfObject || !!isArrayOfCombinator"

                       @deleteByTool="onDeleteByTool"

                       class="dropItem"
            />
          </div>
        </template>
      </Vuedraggable>

    </div>

  </div>
</template>

<style>
.arrayTool:not(.isRoot) {
  background-color: var(--tool-control-secondary);
}
</style>

<style scoped>
.arrayTool {
  @apply
  relative
}

.dropArea .arrayTool {
  min-height: 140px !important;
}
</style>

<script setup>

import Actions from "./utils/Actions.vue";

import {deleteToolInChilds, Vuedraggable} from '../../index'
import {computed, onMounted, ref} from "vue";
import {emitter} from "../../lib/mitt";
import {cloneEmptyTool} from "../../lib/formbuilder";
import {initArrayElements} from "../../lib/initializer";
import {useJsonforms} from "../../composable/jsonforms";
import ToolIcon from "./utils/ToolIcon.vue";
import {Icon} from "@iconify/vue";
import {scalarTypes, toolComponentProps, vuedraggableOptions} from "../../lib/models";
import {ReferenceTool} from "../../lib/tools/referenceTool";
import {CombinatorTool} from "../../lib/tools/combinatorTool";
import {getFormbuilder, getToolDragging, getToolfinder} from "../../lib/vue";

const props = defineProps({...toolComponentProps()})

const emit = defineEmits(['deleteByTool']);


const childTools = ref([]);
const collapsed = ref(false);

const isArrayOfObject = computed(() => 'object' === getFirstChildItemsType.value);
const isInlineType = computed(() => childTools.value.length >= 1 && scalarTypes.includes(getFirstChildItemsType.value));
const isArrayOfRef = computed(() => getFirstChild.value && '$ref' in getFirstChild.value?.schema);
const getFirstChild = computed(() => childTools.value[0]);
const isArrayOfCombinator = computed(() => getFirstChild.value && CombinatorTool.getKeyword(getFirstChild.value?.schema));
const getFirstChildItemsType = computed(() => getFirstChild.value?.schema?.type);
const toolOptions = computed(() => props.tool?.toolbarOptions() ?? {});

const childLayoutTools = computed(() => childTools.value.filter(tool => 'Control' !== tool.uischema.type));
const hasOneLayoutTool = computed(() => childLayoutTools.value.length>=1);

const showAddItem = computed(() => {
  //always if its in layout mode
  if(hasOneLayoutTool.value) {
    return true;
  }
  //array of refs
  // if(isArrayOfRef.value) {
  //   return true;
  // }
  //show only if it has no childs
  return !getFirstChild.value
});

const fb = getFormbuilder();
const toolFinder = getToolfinder();
const onDrag = fb?.exposed.onToolDrag;

onMounted(() => {
  if (!props.isToolbar) {
    if (['array'].includes(props?.tool?.schema?.type)) {

      childTools.value.push(...initArrayElements(toolFinder, props.tool));

      //wait to render dom
      if (childTools.value.length) {
        setTimeout(onDropAreaChange, 20);
      }
    }

    if(!childTools.value?.length) {
      addItem({type:'object',properties:{}})
    }
  }
})


const onDropAreaChange = (e) => {
  props.tool.childs = childTools.value;
  emitter.emit('formBuilderUpdated')
};

const addItem = (initSchema = undefined) => {
  const {schema} = useJsonforms();

  initSchema = initSchema ?? {type:'string'};
  // if(isArrayOfRef.value) {
  //   initSchema = {$ref:'#'}
  // }

  const tool = cloneEmptyTool(toolFinder.findMatchingTool(schema, initSchema, {type: 'Control', scope: '#'}), initSchema);

  childTools.value.push(tool);
  onDropAreaChange(null);
};


const groupPut = (from, to, node, dragEvent) => {
  const tool = node._underlying_vm_;

  const isControlTool = 'Control' === tool.uischema?.type;
  //const isRefTool = '$ref' in tool.schema;//not working!!!
  //const isRefTool = tool instanceof ReferenceTool;//not working!!!
  const isRefTool = 'ReferenceTool' === tool.constructor.name;

  //const isInlineType = scalarTypes.includes(props.tool?.schema?.items?.type)
  const hasOneItem = from.el.children.length > 0;

  // if(isArrayOfRef.value && isRefTool) {
  //   return true;
  // }

  const childLayoutTools = childTools.value.filter(tool => 'Control' !== tool.uischema.type);
  const hasOneLayoutTool = childLayoutTools.length>=1;

  if(hasOneLayoutTool) {
    return false;
  }
  return !hasOneItem
};

const onDeleteByTool = async (e) => {
  e.tool && deleteToolInChilds(e.tool, childTools.value)
      .then(newChildTools => {
        childTools.value = newChildTools;
        onDropAreaChange(e);
      })
};

const onDelete = () => {
  emit("deleteByTool", { tool: props.tool });
};

const showDragClass = computed(() => {
  const toolDragging = getToolDragging();
  const isControl = 'Control' === toolDragging?.uischema?.type;
  const isRefTool = toolDragging instanceof ReferenceTool;

  // if(isArrayOfRef.value && isRefTool) {
  //   return true;
  // }

  if(true === isInlineType.value) {
    return false;
  }

  return isControl && !getFirstChild.value;
})
</script>
