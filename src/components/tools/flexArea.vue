<template>
  <div class="flexAreaTool" :class="['rootItem', {isRoot:isRoot}]" ref="flexAreaTool">

    <ToolIcon :tool="tool" :isToolbar="isToolbar">
    </ToolIcon>

    <div v-if="!isToolbar" :class="['flex',{'mr-5':!isRoot}]">

      <Actions :tool="tool" @delete="onDelete" :deletable="!isRoot">
        <button type="button" @click="collapsed=!collapsed;" v-if="!isRoot"><Icon :icon="collapsed ? 'mdi:arrow-expand-vertical' : 'mdi:arrow-collapse-vertical'" /></button>
      </Actions>

      <!--
        @see http://sortablejs.github.io/Sortable/#thresholds
      -->
      <Vuedraggable
          :class="['dropArea nestedFlexArea', tool.uischema.type, {drag:showDragClass}]"
          :list="childTools"
          group="formBuilder"
          item-key="uuid"
          @start="onDrag"
          @end="onDrag"
          @change="onDropAreaChange"

          :swapThreshold=".7"
          :invertSwap="true"
          :fallbackOnBody="true"

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

.flexAreaTool:not(.isRoot){
  background-color: var(--tool-layout);
}
.flexAreaTool {
  @apply relative
  h-full
}

.dropArea {
  min-height: 140px;

  background-image: radial-gradient(var(--dropArea-dots) 10%, var(--dropArea) 0%);
  background-position: 0 0;
  background-size: 5px 5px;

  @apply
  w-full
  flex-grow

  overflow-auto

  p-2

  rounded-lg

  border-2 border-dashed
  border-transparent
  transition-colors

  gap-2
}

.dropArea.drag {
  border-color:var(--dropArea-dragBorder);
  @apply
  border-dashed
}

.nestedFlexArea {
  @apply
  flex items-stretch
}

.nestedFlexArea:not(.HorizontalLayout) {
  @apply
  flex-col
}

.nestedFlexArea.HorizontalLayout {
  @apply
  flex-row
}

.nestedFlexArea > * {
  @apply w-full flex-shrink
}

.dropItem {
  @apply
  shadow-lg
  cursor-move
  relative
}

.dropItem,
.dropArea .toolItem {
  min-height: 100px;
  border-color: var(--toolItem-border);
  @apply
  border
  p-4
  rounded
}


.sortable-chosen {
  @apply
  filter grayscale
  opacity-80
}

</style>

<script setup>
/**
 * @see https://sortablejs.github.io/vue.draggable.next/#/clone-on-control
 */
import {  initElements} from "../../lib/initializer";
import {  emitter} from "../../lib/mitt";
import Actions from "./utils/Actions.vue";
import {deleteToolInChilds, Vuedraggable} from '../../index'
import {ref, computed, onMounted, unref, toRaw} from 'vue';
import ToolIcon from "./utils/ToolIcon.vue";
import {Icon} from "@iconify/vue";
import {useFormbuilder} from "../../composable/formbuilder";

const props = defineProps({
  tool: Object,//ToolInterface,
  isRoot: Boolean,
  isToolbar: Boolean,
})

const emit = defineEmits(['deleteByTool']);

const {onDrag, toolDragging} = useFormbuilder();

const childTools = ref([]);
const collapsed = ref(false);


onMounted(() => {
  if (!props.isToolbar) {
    init();
  }
})

const init = () => {
  childTools.value = [];
  childTools.value.push(...initElements(props.tool))

  if (childTools.value.length) {
    //wait to render dom (:TODO use nextTick)
    setTimeout(onDropAreaChange, 50);
  }
};

const onDeleteByTool = async (e) => {
  e.tool && deleteToolInChilds(e.tool, childTools.value)
      .then(newChildTools => {
        childTools.value = newChildTools;
        onDropAreaChange(e);
      })
};

const onDropAreaChange = (e) => {
  props.tool.childs = childTools.value;
  emitter.emit('formBuilderUpdated', e)
};

const onDelete = () => {
  emit("deleteByTool", { tool: props.tool });
};

const showDragClass = computed(() => {
  const isCategory = 'Category' === toolDragging.value?.uischema?.type;

  return !isCategory && !!toolDragging.value;
})

</script>
