<template>
  <div class="arrayTool rootItem" :class={isInlineType:isInlineType,isRoot:isRoot} :title="toolOptions.title">

    <ToolIcon :tool="tool" :isToolbar="isToolbar">
      <template v-slot:droparea>
        <b>{{ tool.propertyName }}:</b> Array
        <span v-if="getFirstChildItemsType"> of {{ getFirstChildItemsType }}</span>
        <span v-else-if="isArrayOfRef"> of Refs</span>
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
          :class="['dropArea nestedFlexArea flex-col', {drag:dragSchema}]"
          :list="childTools"
          :group="{name:'formBuilderArray', pull: true, put: groupPut}"
          item-key="uuid"
          @start="dragSchema = true"
          @end="dragSchema = false"
          @change="onDropAreaChange"
          v-show="!collapsed"
      >
        <template #item="{ element: tool, index }">
          <div> <!-- div needed for edit mode?!?! -->
            <component :is="tool.importer()"

                       :tool="tool"
                       :isToolbar="false"
                       :isDragging=isDragging
                       :index="index"
                       :isInlineType="isInlineType || isArrayOfRef || isArrayOfObject || !!isArrayOfCombinator"

                       @deleteByIndex="onDeleteByIndex"

                       class="dropItem"
                       :ref="addChildComponent"
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

import {Vuedraggable} from '../../index'
import {computed, onMounted, ref} from "vue";
import {emitter} from "../../lib/mitt";
import {useTools} from "../../composable/tools";
import {cloneEmptyTool} from "../../lib/formbuilder";
import {initArrayElements} from "../../lib/initializer";
import {useJsonforms} from "../../composable/jsonforms";
import ToolIcon from "./utils/ToolIcon.vue";
import {Icon} from "@iconify/vue";
import {scalarTypes} from "../../lib/models";
import {ReferenceTool} from "../../lib/tools/referenceTool";
import {CombinatorTool} from "../../lib/tools/combinatorTool";

const props = defineProps({
  tool: Object,//ToolInterface,
  isToolbar: Boolean,
  isRoot: Boolean,
  index: Number, //for deleting correct element in list

  isDragging: Boolean, //needed in flexarea
})

const emit = defineEmits(['deleteByIndex']);

const drag = ref(false);
const dragSchema = ref(false);
const childTools = ref([]);
const childComponents = ref({});
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
  if(isArrayOfRef.value) {
    return true;
  }
  //show only if it has no childs
  return !getFirstChild.value
});

onMounted(() => {
  if (!props.isToolbar) {
    if (['array'].includes(props?.tool?.schema?.type)) {
      childTools.value.push(...initArrayElements(props.tool));

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

const addChildComponent = (e) => {
  if (e?.tool?.uuid) {
    childComponents.value[e.tool.uuid] = e;
  }
}
const onDropAreaChange = (e) => {
  props.tool.childs = childTools.value;
  emitter.emit('formBuilderUpdated')
};

const addItem = (initSchema = undefined) => {
  const {schema} = useJsonforms();
  const {findMatchingTool} = useTools();

  initSchema = initSchema ?? {type:'string'};
  if(isArrayOfRef.value) {
    initSchema = {$ref:'#'}
  }

  console.log("initSchema",initSchema);

  const tool = cloneEmptyTool(findMatchingTool(schema, initSchema, {type: 'Control', scope: '#'}), initSchema);

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

  if(isArrayOfRef.value && isRefTool) {
    return true;
  }

  const childLayoutTools = childTools.value.filter(tool => 'Control' !== tool.uischema.type);
  const hasOneLayoutTool = childLayoutTools.length>=1;

  if(hasOneLayoutTool) {
    return false;
  }
  return !hasOneItem
};

//defineExpose({tool: props.tool, childTools: childTools, childComponents: childComponents})

const onDeleteByIndex = (e) => {
  const index = e.index;
  const toolDeleted = childTools.value[index];

  childTools.value.splice(index, 1);
  delete childComponents.value[toolDeleted.uuid];

  emitter.emit('formBuilderUpdated')
};
const onDelete = () => {
  Promise.resolve(window.confirm("Wirklich löschen?"))
      .then((confirmed) => {
        if(confirmed) {
          emit("deleteByIndex", { index: props.index });
        }
      });
};

</script>
