<template>
  <div class="combinatorTool">

    <ElementHeadOrToolIcon :isToolbar="isToolbar" :tool="tool"/>

    <div v-if="!isToolbar">

      <Actions :tool="tool" @delete="onDelete"/>


      type: {{ tool?.keyword }}

      <div class="tabs">
        <div class="flex items-center">
          <button type="button" class="add" @click="addItem" v-text="'[Add]'"/>
        </div>
      </div>

      <Vuedraggable
          :class="['dropArea bg-dotted nestedFlexArea flex-col', {drag:dragSchema}]"
          :list="childTools"
          :group="{name:'formBuilderCombinator', pull: true, put: groupPut}"
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
.combinatorTool {
  @apply
  bg-green-100 !important
}
</style>

<style scoped>
.combinatorTool {
  min-height: auto;
  @apply
  relative
  bg-green-100
}
</style>

<script setup>

import Actions from "./utils/Actions.vue";
import ElementHeadOrToolIcon from "./utils/ElementHeadOrToolIcon.vue";

import Vuedraggable from 'vuedraggable'
import {computed, onMounted, ref} from "vue";
import {emitter} from "../../lib/mitt";
import {useTools} from "../../composable/tools";
import {cloneEmptyTool, initCombinatorElements} from "../../lib/formbuilder";
import {useJsonforms} from "../../composable/jsonforms";
import {CombinatorTool} from "../../lib/tools/combinatorTool";

const props = defineProps({
  tool: Object,//ToolInterface,
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
    const combinatorSchemas = CombinatorTool.getKeywordSchemas(props.tool.schema);

    if (combinatorSchemas) {
      childTools.value.push(...initCombinatorElements(props.tool));

      //wait to render dom
      if (childTools.value.length) {
        setTimeout(onDropAreaChange, 20);
      }
    } else {
      addItem()
    }
  }
})
const keyword = computed(() => {
  return CombinatorTool.getKeyword(props?.tool?.schema)
});

const addChildComponent = (e) => {
  if (e?.tool?.uuid) {
    childComponents.value[e.tool.uuid] = e;
  }
}
const onDropAreaChange = (e) => {
  //window.setTimeout(buildTabLabels,50);
  emitter.emit('formBuilderUpdated')
};

const addItem = () => {
  const {schema} = useJsonforms();
  const {findMatchingTool} = useTools();

  //const initSchema = {$ref: '#/definitions/'}
  const initSchema = {type:'string'}
  const tool = cloneEmptyTool(findMatchingTool(schema, initSchema, {type: 'Control', scope: '#'}), initSchema);

  childTools.value.push(tool);
  //window.setTimeout(buildTabLabels,50);
  emitter.emit('formBuilderUpdated')
};


const groupPut = (from, to, node, dragEvent) => {
  const tool = node._underlying_vm_;
  const isControlTool = ['control'].includes(tool.toolType);//;
  return isControlTool;
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