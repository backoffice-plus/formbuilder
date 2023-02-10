<template>
  <div class="flexAreaTool" :class="['group/itemF']" ref="flexAreaTool">

    <ToolIcon :tool="tool" :isToolbar="isToolbar">
    </ToolIcon>

    <div v-if="!isToolbar" :class="['flex',{'mr-5':!isRoot}]">

      <Actions :class="['opacity-0', 'group-hover/itemF:opacity-100']" :tool="tool" @delete="onDelete" v-if="!isRoot"/>

      <!--
        @see http://sortablejs.github.io/Sortable/#thresholds
      -->
      <Vuedraggable
          :class="['dropArea bg-dotted nestedFlexArea', tool.uischemyType, {drag:isDragging||drag}]"
          :list="childTools"
          group="formBuilder"
          item-key="uuid"
          @start="drag = true"
          @end="drag = false"
          @change="onDropAreaChange"

          :swapThreshold=".7"
          :invertSwap="true"
          :fallbackOnBody="true"
      >
        <template #item="{ element: tool, index }">
          <div> <!-- div needed for edit mode?!?! -->
            <component :is="tool.importer()"

                       :tool="tool"
                       :isToolbar="false"
                       :isDragging=!!(isDragging||drag)
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

.flexAreaTool {
  @apply relative
  h-full
}

.bg-dotted {
  background-image: radial-gradient(#b4b4b4 10%, #fff 0%);
  background-position: 0 0;
  background-size: 5px 5px;
}

.dropArea {
  min-height: 80px;
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
  @apply
  border-dashed border-black
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
  @apply
  bg-blue-50
  border border-blue-100
  p-4
  rounded
}

.dropItem.formInputByTypeTool {
  @apply
  bg-blue-100
  border border-blue-200
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
import {  initElements} from "../../lib/formbuilder";
import {  emitter} from "../../lib/mitt";
import Actions from "./utils/Actions.vue";
import Vuedraggable from 'vuedraggable'
import {ref, computed, onMounted} from 'vue';
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
const childTools = ref([]);
const childComponents = ref({});

const addChildComponent = (e) => {
  if(e?.tool?.uuid) {
    childComponents.value[e.tool.uuid]=e;
  }
}

defineExpose({ tool:props.tool, childTools:childTools, childComponents:childComponents })

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

const onDeleteByIndex = (e) => {
  const index = e.index;
  childTools.value.splice(index, 1);

  onDropAreaChange(e);
};

const onDropAreaChange = (e) => {
  emitter.emit('formBuilderUpdated', e)
};

const onDelete = () => {
  if (confirm("Wirklich löschen?")) {
    emit('deleteByIndex', {index: props.index});
  }
};
</script>
