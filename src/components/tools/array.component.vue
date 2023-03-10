<template>
  <div class="arrayTool rootItem" :class={isInlineType:isInlineType,isRoot:isRoot} :title="toolOptions.title">

    <ToolIcon :tool="tool" :isToolbar="isToolbar">
      <template v-slot:droparea>
        <b>{{ tool.propertyName }}:</b> Array
        <span v-if="!isInlineType && props.tool.schema?.items?.type"> of {{ props.tool.schema.items.type }}</span>
        <span v-if="isInlineType && getInlineType"> of {{ getInlineType?.schema?.type }}</span>
        <span v-if="isArrayOfRef"> of Refs</span>
      </template>

    </ToolIcon>

    <div v-if="!isToolbar" :class="[{'mr-5':!isRoot}]">

      <Actions :tool="tool" @delete="onDelete" :deletable="!isRoot">
        <button type="button" @click="addItem" v-if="!isInlineType && !isArrayOfRef"><Icon icon="mdi:plus" /></button>
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
                       :isInlineType="isInlineType || isArrayOfRef"

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

const isArrayOfObject = computed(() => 'object' === props.tool.schema?.items?.type);
const isInlineType = computed(() => !isArrayOfObject.value && childTools.value.length >= 1 && undefined !== props.tool.schema?.items?.type);
const isArrayOfRef = computed(() => '$ref' in props.tool.schema?.items);
const getInlineType = computed(() => childTools.value[0]);
const toolOptions = computed(() => props.tool?.toolbarOptions() ?? {});

onMounted(() => {
  if (!props.isToolbar) {
    if (['array'].includes(props?.tool?.schema?.type)) {
      childTools.value.push(...initArrayElements(props.tool));

      //wait to render dom
      if (childTools.value.length) {
        setTimeout(onDropAreaChange, 20);
      }
    }
    // else {
    //   addSchema();
    // }
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

const addItem = () => {
  const {schema} = useJsonforms();
  const {findMatchingTool} = useTools();

  const initSchema = {type:'string'}
  const tool = cloneEmptyTool(findMatchingTool(schema, initSchema, {type: 'Control', scope: '#'}), initSchema);

  childTools.value.push(tool);
  onDropAreaChange(null);
};


const groupPut = (from, to, node, dragEvent) => {
  const tool = node._underlying_vm_;
  const isControlTool = 'Control' === tool.uischema?.type;
  const isInlineType = 'object' !== props.tool?.schema?.items?.type
  const hasOneItem = from.el.children.length > 0;

  const childLayoutTools = childTools.value.filter(tool => 'Control' !== tool.uischema.type);
  const hasOneLayoutTool = childLayoutTools.length>=1;

  if(hasOneLayoutTool || (hasOneItem && !isControlTool)) {
    return false;
  }

  return (!isInlineType || (isInlineType && !hasOneItem));
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
