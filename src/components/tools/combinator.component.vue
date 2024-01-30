<template>
  <div class="combinatorTool" :class="['rootItem', {isRoot:isRoot}]">

    <slot name="header">
      <ToolIcon :tool="tool" :isToolbar="isToolbar">
        <template v-slot:droparea>
          <template v-if="!isInlineType">
            <b>{{ tool.propertyName }}:</b>
          </template>
          {{ CombinatorTool.getKeyword(tool.schema) }}
          <SchemaFeatures :tool="tool" />
        </template>
      </ToolIcon>
    </slot>

    <div v-if="!isToolbar" :class="[{'mr-5':!isRoot}]">

      <Actions :tool="tool" @delete="onDelete" :deletable="!isRoot">
        <button type="button" @click="addItem"><Icon icon="mdi:plus" /></button>
        <button type="button" @click="collapsed=!collapsed;" v-if="!isRoot"><Icon :icon="collapsed ? 'mdi:arrow-expand-vertical' : 'mdi:arrow-collapse-vertical'" /></button>
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

        <template #footer>
          <FooterActions
              :showAdd="true"
              @add="addItem"
          />
        </template>

      </Vuedraggable>

    </div>

  </div>
</template>

<style>
.combinatorTool:not(.isRoot) {
  background-color: var(--tool-control-secondary);
}
</style>

<style scoped>
.combinatorTool {
  @apply
  relative
}
.dropArea .combinatorTool {
   min-height:180px !important;
 }
</style>

<script setup>

import Actions from "./utils/Actions.vue";
import Vuedraggable from "vuedraggable"
import {confirmAndRemoveChild, prepareAndCallOnDropAreaChange} from '../..'
import {computed, nextTick, onMounted, ref} from "vue";
import {toolComponentProps, vuedraggableOptions} from "../../lib/models";
import {CombinatorTool} from "../../lib/tools/combinatorTool";
import ToolIcon from "./utils/ToolIcon.vue";
import {Icon} from "@iconify/vue";
import {getFormbuilder, getToolDragging, getToolfinder} from "../../lib/vue";
import SchemaFeatures from "./utils/SchemaFeatures.vue";
import FooterActions from "@/components/tools/utils/FooterActions.vue";

const props = defineProps({...toolComponentProps()})

const emit = defineEmits(['deleteByTool']);

const childTools = ref([]);
const collapsed = ref(false);

const fb = getFormbuilder();
const toolFinder = getToolfinder();
const onDrag = fb?.exposed.onToolDrag;

onMounted(() => {
  if (!props.isToolbar) {
      childTools.value.push(...props.tool.initChilds(toolFinder));

      if (childTools.value.length) {
        nextTick().then(() => onDropAreaChange({mounted:{element:props.tool}}))
      }
  }
})
const keyword = computed(() => {
  return CombinatorTool.getKeyword(props?.tool?.schema)
});

const onDropAreaChange = (e) => prepareAndCallOnDropAreaChange(e, props.tool, childTools.value, fb?.exposed?.onDropAreaChanged);

const addItem = () => {
  const schema = fb?.exposed?.rootSchema?.value;

  //const initSchema = {$ref: '#/definitions/'}
  const initSchema = {type:'string'}
  const tool = toolFinder.findMatchingToolAndClone(schema, initSchema, {type: 'Control', scope: '#'});

  childTools.value.push(tool);
  onDropAreaChange({added: {element:tool}});
};

const groupPut = (from, to, node, dragEvent) => {
  const tool = node._underlying_vm_;
  const isControlTool = 'Control' === tool.uischema?.type;
  return isControlTool;
};

const onDeleteByTool = (e) => confirmAndRemoveChild(props.tool, e.tool, fb).then(e => {
    childTools.value = props.tool.edge.childs;
    onDropAreaChange(e);
});

const onDelete = () => {
  emit("deleteByTool", { tool: props.tool });
};

const showDragClass = computed(() => {
  const toolDragging = getToolDragging();
  const isControl = 'Control' === toolDragging?.uischema?.type;

  return isControl;
})

</script>
