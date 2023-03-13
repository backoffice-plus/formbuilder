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
            :class="['dropArea nestedFlexArea flex-col', {drag:dragSchema}]"
            :list="childTools"
            :group="{name:'formBuilderSchema', pull: true, put: groupPut}"
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

import {Vuedraggable} from '../../index'
import {onMounted, ref} from "vue";
import {emitter} from "../../lib/mitt";
import {useTools} from "../../composable/tools";
import {cloneEmptyTool} from "../../lib/formbuilder";
import {initObjectElements} from "../../lib/initializer";
import {useJsonforms} from "../../composable/jsonforms";
import _ from "lodash";
import ToolIcon from "./utils/ToolIcon.vue";
import {Icon} from "@iconify/vue";

const props = defineProps({
  tool: Object,//ToolInterface,
  isRoot: Boolean,
  isToolbar: Boolean,
  index: Number, //for deleting correct element in list

  isDragging: Boolean, //needed in flexarea
  isInlineType: Boolean, //from arrayTool
})

const emit = defineEmits(['deleteByIndex']);

const drag = ref(false);
const dragSchema = ref(false);
const childTools = ref([]);
const childComponents = ref({});
const collapsed = ref(false);

onMounted(() => {
  if (!props.isToolbar) {
      childTools.value.push(...initObjectElements(props?.tool));

      //wait to render dom
      if (childTools.value.length) {
        setTimeout(onDropAreaChange, 20);
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

const addItem = (type) => {
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
  return isControlTool
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
