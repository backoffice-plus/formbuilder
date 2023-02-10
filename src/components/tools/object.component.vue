<template>
  <div class="objectTool" :class="[{root:isRoot}]">

    <ToolIcon :tool="tool" :isToolbar="isToolbar">
      <template v-slot:droparea>
        <b>{{ tool.propertyName }}</b>
      </template>
    </ToolIcon>

    <div v-if="!isToolbar" :class="[{'mr-5':!isRoot}]">

      <Actions :tool="tool" @delete="onDelete" v-if="!isRoot"/>


<!--        <div class="tabs">-->
<!--          <div class="flex items-center">-->
<!--            <button type="button" class="add" @click="addItem('object')" v-text="'[Object]'"/>-->
<!--            <button type="button" class="add" @click="addItem('string')" v-text="'[String]'"/>-->
<!--          </div>-->
<!--        </div>-->

        <Vuedraggable
            :class="['dropArea bg-dotted nestedFlexArea flex-col', {drag:dragSchema}]"
            :list="childTools"
            :group="{name:'formBuilderSchema', pull: true, put: groupPut}"
            item-key="uuid"
            @start="dragSchema = true"
            @end="dragSchema = false"
            @change="onDropAreaChange"
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
.objectTool {
  @apply
  bg-green-100 !important
}

.objectTool.root {
  @apply
  bg-transparent !important
}
</style>

<style scoped>
.objectTool {
  @apply
  relative
  bg-green-100
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
import {cloneEmptyTool, initObjectElements} from "../../lib/formbuilder";
import {useJsonforms} from "../../composable/jsonforms";
import _ from "lodash";
import ToolIcon from "./utils/ToolIcon.vue";

const props = defineProps({
  tool: Object,//ToolInterface,
  isRoot: Boolean,
  isToolbar: Boolean,
  index: Number, //for deleting correct element in list

  isDragging: Boolean, //needed in flexarea
})

const emit = defineEmits(['deleteByIndex']);

const drag = ref(false);
const dragSchema = ref(false);
const childTools = ref([]);
const childComponents = ref({});

onMounted(() => {
  if (!props.isToolbar) {
    if (!_.isEmpty(props?.tool?.schema?.properties)) {
      childTools.value.push(...initObjectElements(props?.tool));

      //wait to render dom
      if (childTools.value.length) {
        setTimeout(onDropAreaChange, 20);
      }
    }
  }
})

const addChildComponent = (e) => {
  if (e?.tool?.uuid) {
    childComponents.value[e.tool.uuid] = e;
  }
}
const onDropAreaChange = (e) => {
  //window.setTimeout(buildTabLabels,50);
  emitter.emit('formBuilderUpdated')
};

const addItem = (type) => {
  const {schema} = useJsonforms();
  const {findMatchingTool} = useTools();

  const tool = cloneEmptyTool(props.tool, {type: type});

  childTools.value.push(tool);
  //window.setTimeout(buildTabLabels,50);
  emitter.emit('formBuilderUpdated')
};


const groupPut = (from, to, node, dragEvent) => {
  const tool = node._underlying_vm_;
  const isControlTool = ['control', 'select', 'array', 'object', 'combinator'].includes(tool.toolType);//;
  return isControlTool
};

defineExpose({tool: props.tool, childTools: childTools, childComponents: childComponents})

const onDeleteByIndex = (e) => {
  const index = e.index;
  childTools.value.splice(index, 1);

  emitter.emit('formBuilderUpdated')
};
const onDelete = () => {
  if (confirm("Wirklich löschen?")) {
    emit('deleteByIndex', {index: props.index});
  }
};

</script>
