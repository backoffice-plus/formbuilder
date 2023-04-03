<template>
  <div class="schemaTool" :class="['rootItem', {isRoot:isRoot}]">

    <ToolIcon :tool="tool" :isToolbar="isToolbar">
      <template v-slot:droparea>
        {{ tool.keyword }}
      </template>
    </ToolIcon>

    <div v-if="!isToolbar" :class="[{'mr-5':!isRoot}]">

      <Actions :tool="tool" @delete="onDelete" :deletable="!isRoot">
        <!--        <button type="button" @click="addItem"><Icon icon="mdi:plus" /></button>-->
        <button type="button" @click="collapsed=!collapsed;" v-if="!isRoot">
          <Icon :icon="collapsed ? 'mdi:arrow-expand-vertical' : 'mdi:arrow-collapse-vertical'"/>
        </button>
      </Actions>

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
                       :isInlineType="true"

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
.schemaTool:not(.isRoot) {
  background-color: var(--tool-control-secondary);
}
</style>

<style scoped>
.schemaTool {
  @apply
  relative
}

.dropArea .schemaTool {
  min-height: 180px !important;
}
</style>

<script setup>
import {computed, nextTick, onMounted, ref} from "vue";
import {Icon} from "@iconify/vue";
import {cloneToolWithSchema, deleteToolInChilds, normalizePath, Vuedraggable} from '../../index'
import {toolComponentProps, vuedraggableOptions} from "../../lib/models";
import {getFormbuilder, getToolDragging, getToolfinder} from "../../lib/vue";
import {initObjectElements} from "../../lib/initializer";
import ToolIcon from "./utils/ToolIcon.vue";
import Actions from "./utils/Actions.vue";
import _ from "lodash";

const props = defineProps({...toolComponentProps()})

const emit = defineEmits(['deleteByTool']);

const childTools = ref([]);
const collapsed = ref(false);

const fb = getFormbuilder();
const toolFinder = getToolfinder();
const onDrag = fb?.exposed.onToolDrag;

onMounted(() => {
  if (!props.isToolbar) {

    //old behavior: schemaTool behaves like a normal child
    //childTools.value.push(...initObjectElements(toolFinder, props.tool));

    const itemSchema = props.tool.schema;
    if(!_.isEmpty(itemSchema)) {
      const itemUischema = {type:'Control',scope:'#'};
      const clone = cloneToolWithSchema(toolFinder.findMatchingTool({}, itemSchema, itemUischema), itemSchema, itemUischema)
      clone.propertyName = false;

      childTools.value.push(clone);
    }


    if (childTools.value.length) {
      nextTick().then(() => onDropAreaChange({mounted:{element:props.tool}}))
    }
  }
})

const onDropAreaChange = (e) => {
  props.tool.childs = childTools.value;
  fb?.exposed?.onDropAreaChanged(e);
};

// const addItem = () => {
//   const schema = fb?.exposed?.rootSchema?.value;
//
//   //const initSchema = {$ref: '#/definitions/'}
//   const initSchema = {type:'string'}
//   const tool = cloneEmptyTool(toolFinder.findMatchingTool(schema, initSchema, {type: 'Control', scope: '#'}), initSchema);
//
//   childTools.value.push(tool);
//   onDropAreaChange(null);
// };

const groupPut = (from, to, node, dragEvent) => {
  const tool = node._underlying_vm_;
  const isControlTool = 'Control' === tool.uischema?.type;
  const hasNoItem = from.el.children.length === 0;
  return hasNoItem && isControlTool;
};

const onDeleteByTool = async (e) => {
  e.tool && deleteToolInChilds(e.tool, childTools.value)
      .then(newChildTools => {
        childTools.value = newChildTools;
        onDropAreaChange(e);
      })
};

const onDelete = () => {
  emit("deleteByTool", {tool: props.tool});
};

const showDragClass = computed(() => {
  const toolDragging = getToolDragging();
  const isControl = 'Control' === toolDragging?.uischema?.type;
  const hasNoItem = props.tool.childs.length === 0;

  return hasNoItem && isControl;
})

</script>
