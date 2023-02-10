<template>
  <div class="arrayTool" :title="toolOptions.title">

    <ToolIcon :tool="tool" :isToolbar="isToolbar">
      <template v-slot:droparea>
        <b>{{ tool.propertyName }}:</b> Array&nbsp;
        <span v-if="!hasSingleChild && props.tool.schema?.items?.type"> of {{ props.tool.schema.items.type }}</span>
        <span v-if="hasSingleChild && getSingleChild"> of {{ getSingleChild?.schema?.type }}</span>
      </template>

    </ToolIcon>

    <div v-if="!isToolbar">

      <Actions :tool="tool" @delete="onDelete"/>

      <div class="tabs" v-if="!hasSingleChild">
        <div class="flex items-center">
          <button type="button" class="add" @click="addItem" v-text="'[Add]'"/>
        </div>
      </div>

      <Vuedraggable
          :class="['dropArea bg-dotted nestedFlexArea flex-col', {drag:dragSchema}]"
          :list="childTools"
          :group="{name:'formBuilderArray', pull: true, put: groupPut}"
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
.arrayTool {
  @apply
  bg-green-100 !important
}
</style>

<style scoped>
.arrayTool {
  @apply
  relative
  bg-green-100
}

.dropArea .arrayTool {
  min-height: 160px !important;
}
</style>

<script setup>

import Actions from "./utils/Actions.vue";

import {Vuedraggable} from '../../index'
import {computed, onMounted, ref} from "vue";
import {emitter} from "../../lib/mitt";
import {useTools} from "../../composable/tools";
import {cloneEmptyTool, initArrayElements} from "../../lib/formbuilder";
import {useJsonforms} from "../../composable/jsonforms";
import ToolIcon from "./utils/ToolIcon.vue";

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

const isArrayOfObject = computed(() => 'object' === props.tool.schema?.items?.type);
const hasSingleChild = computed(() => !isArrayOfObject.value && childTools.value.length >= 1);
const getSingleChild = computed(() => childTools.value[0]);
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
  //window.setTimeout(buildTabLabels,50);
  emitter.emit('formBuilderUpdated')
};

const addItem = () => {
  const {schema} = useJsonforms();
  const {findMatchingTool} = useTools();

  const tool = cloneEmptyTool(findMatchingTool(schema, {type: 'string'}, {
    type: 'Control',
    scope: '#'
  }), {type: 'string'});

  childTools.value.push(tool);
  //window.setTimeout(buildTabLabels,50);
  emitter.emit('formBuilderUpdated')
};


const groupPut = (from, to, node, dragEvent) => {
  const tool = node._underlying_vm_;
  const isControlTool = ['control', 'select', 'array'].includes(tool.toolType);//;
  const canHaveMoreThenOneChild = true; //:TODO
  const hasOneItem = from.el.children.length > 0;
  return isControlTool && (canHaveMoreThenOneChild || !hasOneItem);
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
