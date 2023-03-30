<template>
  <div class="objectTool" :class="['rootItem', {isRoot:isRoot}]">

    <ToolIcon :tool="tool" :isToolbar="isToolbar">
      <template v-slot:droparea>
        <template v-if="!isInlineType">
          <b>{{ tool.propertyName }}</b>
        </template>
      </template>
    </ToolIcon>

    <div v-if="!isToolbar" :class="[isRoot?'mr-9':'mr-5']">

      <Actions :tool="tool" @delete="onDelete" :deletable="!isRoot">
        <button type="button" @click="addItem"><Icon icon="mdi:plus" /></button>
        <button type="button" @click="collapsed=!collapsed;" v-if="!isRoot"><Icon :icon="collapsed ? 'mdi:arrow-expand-vertical' : 'mdi:arrow-collapse-vertical'" /></button>
      </Actions>


<!--        <div class="tabs">-->
<!--          <div class="flex items-center">-->
<!--            <button type="button" class="add" @click="addItem('object')" v-text="'[Object]'"/>-->
<!--            <button type="button" class="add" @click="addItem('string')" v-text="'[String]'"/>-->
<!--          </div>-->
<!--        </div>-->

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
.objectTool:not(.isRoot) {
  background-color: var(--tool-control-secondary);
}
</style>

<style scoped>
.objectTool {
  @apply
  relative
}
.dropArea .objectTool {
   min-height:140px !important;
 }
</style>

<script setup>

import Actions from "./utils/Actions.vue";
import ElementHeadOrToolIcon from "./utils/ElementHeadOrToolIcon.vue";

import {deleteToolInChilds, Vuedraggable} from '../../index'
import {computed, onMounted, ref} from "vue";
import {emitter} from "../../lib/mitt";
import {cloneEmptyTool} from "../../lib/formbuilder";
import {toolComponentProps, vuedraggableOptions} from "../../lib/models";
import {initObjectElements} from "../../lib/initializer";
import {useJsonforms} from "../../composable/jsonforms";
import _ from "lodash";
import ToolIcon from "./utils/ToolIcon.vue";
import {Icon} from "@iconify/vue";
import {useFormbuilder} from "../../composable/formbuilder";
import {getToolfinder} from "../../lib/vue";

const props = defineProps({...toolComponentProps()})

const emit = defineEmits(['deleteByTool']);

const {onDrag, toolDragging} = useFormbuilder();

const childTools = ref([]);
const collapsed = ref(false);

const toolFinder = getToolfinder();

onMounted(() => {
  if (!props.isToolbar) {
      childTools.value.push(...initObjectElements(toolFinder, props?.tool));

      //wait to render dom
      if (childTools.value.length) {
        setTimeout(onDropAreaChange, 20);
      }
  }
})

const onDropAreaChange = (e) => {
  props.tool.childs = childTools.value;
  emitter.emit('formBuilderUpdated')
};

const addItem = (type) => {
  const {schema} = useJsonforms();

  const initSchema = {type:'string'}
  const tool = cloneEmptyTool(toolFinder.findMatchingTool(schema, initSchema, {type: 'Control', scope: '#'}), initSchema);

  childTools.value.push(tool);
  onDropAreaChange(null);
};


const groupPut = (from, to, node, dragEvent) => {
  const tool = node._underlying_vm_;
  const isControlTool = 'Control' === tool.uischema?.type;
  return isControlTool
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
  const isControl = 'Control' === toolDragging.value?.uischema?.type;
  return isControl;
})

</script>
