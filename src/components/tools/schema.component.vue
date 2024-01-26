<template>
  <div class="schemaTool" :class="['rootItem', {isRoot:isRoot}]">

    <slot name="header">
      <ToolIcon :tool="tool" :isToolbar="isToolbar" :prefixLabel="prefixLabel" />
    </slot>

    <div v-if="!isToolbar" :class="[{'mr-5':!isRoot}]">

      <Actions :tool="tool" @delete="onDelete" :deletable="!isRoot" v-if="!props.hideActionbar">
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
import {computed, nextTick, onMounted, ref, unref} from "vue";
import {Icon} from "@iconify/vue";
import {default as Vuedraggable} from "../../../packages/_vuedraggable/src/vuedraggable.js";
import {confirmAndRemoveChild, prepareAndCallOnDropAreaChange} from '../../'
import {toolComponentProps, vuedraggableOptions} from "../../lib/models";
import {getFormbuilder, getToolDragging, getToolfinder} from "../../lib/vue";
import ToolIcon from "./utils/ToolIcon.vue";
import Actions from "./utils/Actions.vue";
import * as _ from 'lodash-es';
import {SchemaTool} from "../../lib/tools/SchemaTool";

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
    childTools.value.push(...props.tool.initChilds(toolFinder));

    // const itemSchema = props.tool.schema;
    //
    // if(!_.isEmpty(itemSchema)) {
    //   const itemUischema = {type:'Control',scope:'#'};
    //   const clone = cloneToolWithSchema(toolFinder.findMatchingTool({}, itemSchema, itemUischema), itemSchema, itemUischema)
    //
    //   childTools.value.push(clone);
    // }


     // if(_.isEmpty(itemSchema)) {
     //  // const clone = cloneEmptyTool(new SchemaTool())
     //  // childTools.value.push(clone);
     // }

    if (childTools.value.length) {
      nextTick().then(() => onDropAreaChange({mounted:{element:props.tool}}))
    }
  }
})

const prefixLabel = computed(() => {
    let prefixLabel = '';
    if(!props.isToolbar) {
        prefixLabel = 'schema:';

        if(props.prefixLabel) {
            prefixLabel = props.prefixLabel;
        }
    }
    return prefixLabel
})

const onDropAreaChange = (e) => prepareAndCallOnDropAreaChange(e, props.tool, childTools.value, fb?.exposed?.onDropAreaChanged);

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

const allowChild = (tool) => {

    const hasOneItem = childTools.value.length > 0;

    return !hasOneItem;

  // const isArrayOrObject = ['array','object'].includes(tool?.schema?.type);
  // const isSchemaTool = tool instanceof SchemaTool
  //
  // return isArrayOrObject || isSchemaTool;
}
const showDragClass = computed(() => {
  const tool = getToolDragging();
  return tool && allowChild(unref(tool));
})
const groupPut = (from, to, node, dragEvent) => {
  const tool = node._underlying_vm_;
  return tool && allowChild(unref(tool));
};

const onDeleteByTool = (e) => confirmAndRemoveChild(props.tool, e.tool, fb).then(e => {
    childTools.value = props.tool.edge.childs;
    onDropAreaChange(e);
});

const onDelete = () => {
  emit("deleteByTool", {tool: props.tool});
};


</script>
