<template>
  <div class="combinatorTool" :class="['rootItem', {isRoot:isRoot}]">

    <ToolIcon :tool="tool" :isToolbar="isToolbar">
      <template v-slot:droparea>
        <template v-if="!isInlineType">
          <b>{{ tool.propertyName }}:</b>
        </template>
        {{ CombinatorTool.getKeyword(tool.schema) }}
      </template>
    </ToolIcon>

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
import ElementHeadOrToolIcon from "./utils/ElementHeadOrToolIcon.vue";

import {deleteToolInChilds,  Vuedraggable} from '../../index'
import {computed, onMounted, ref} from "vue";
import {emitter} from "../../lib/mitt";
import {cloneEmptyTool} from "../../lib/formbuilder";
import {toolComponentProps, vuedraggableOptions} from "../../lib/models";
import {initCombinatorElements} from "../../lib/initializer";
import {useJsonforms} from "../../composable/jsonforms";
import {CombinatorTool} from "../../lib/tools/combinatorTool";
import ToolIcon from "./utils/ToolIcon.vue";
import {Icon} from "@iconify/vue";
import _ from "lodash";
import {getFormbuilder, getToolDragging, getToolfinder} from "../../lib/vue";

const props = defineProps({...toolComponentProps()})

const emit = defineEmits(['deleteByTool']);

const childTools = ref([]);
const collapsed = ref(false);

const fb = getFormbuilder();
const toolFinder = getToolfinder();
const onDrag = fb?.exposed.onToolDrag;

onMounted(() => {
  if (!props.isToolbar) {
      childTools.value.push(...initCombinatorElements(toolFinder, props.tool));

      //wait to render dom
      if (childTools.value.length) {
        setTimeout(onDropAreaChange, 20);
      }
  }
})
const keyword = computed(() => {
  return CombinatorTool.getKeyword(props?.tool?.schema)
});

const onDropAreaChange = (e) => {
  props.tool.childs = childTools.value;
  emitter.emit('formBuilderUpdated')
};

const addItem = () => {
  const {schema} = useJsonforms();

  //const initSchema = {$ref: '#/definitions/'}
  const initSchema = {type:'string'}
  const tool = cloneEmptyTool(toolFinder.findMatchingTool(schema, initSchema, {type: 'Control', scope: '#'}), initSchema);

  childTools.value.push(tool);
  onDropAreaChange(null);
};

const groupPut = (from, to, node, dragEvent) => {
  const tool = node._underlying_vm_;
  const isControlTool = 'Control' === tool.uischema?.type;
  return isControlTool;
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

  return isControl;
})

</script>
