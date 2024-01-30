<template>
  <div class="flexAreaTool" :class="['rootItem', {isRoot:isRoot}]" ref="flexAreaTool">

    <slot name="header">
      <ToolIcon :tool="tool" :isToolbar="isToolbar">
      </ToolIcon>
    </slot>

    <div v-if="!isToolbar" :class="['flex',{'mr-5':!isRoot}]">

      <Actions :tool="tool" @delete="onDelete" :deletable="!isRoot">
        <button type="button" @click="addItem" v-if="showAddItem"><Icon icon="mdi:plus" /></button>
        <button type="button" @click="collapsed=!collapsed;" v-if="!isRoot"><Icon :icon="collapsed ? 'mdi:arrow-expand-vertical' : 'mdi:arrow-collapse-vertical'" /></button>
      </Actions>

      <Vuedraggable
          v-bind="vuedraggableOptions"

          :class="['dropArea nestedFlexArea', tool.uischema.type, {drag:showDragClass}]"
          :list="childTools"
          group="formBuilder"
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

        <template #footer>
          <FooterActions
            :showAdd="showAddItem"
            @add="addItem"
            />
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
.dropArea:not(.HorizontalLayout) {
 padding-bottom: 24px;
}
.dropArea.HorizontalLayout {
  padding-right: 24px;
}
.dropItem > div > .dropArea:not(.HorizontalLayout) > footer {
  bottom:16px
}

.dropItem > div > .dropArea.HorizontalLayout > footer {
  right:36px
}




.dropArea.isControl {
    min-height: 80px;
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
import Actions from "./utils/Actions.vue";
import Vuedraggable from "vuedraggable"
import {confirmAndRemoveChild, prepareAndCallOnDropAreaChange, showNewPropertyDialogAndGetTool} from '../../'
import {toolComponentProps, vuedraggableOptions} from "../../lib/models";
import {ref, computed, onMounted, nextTick} from 'vue';
import ToolIcon from "./utils/ToolIcon.vue";
import {Icon} from "@iconify/vue";
import {getFormbuilder, getToolDragging, getToolfinder} from "../../lib/vue";
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
    init();
  }
})

const init = () => {
  childTools.value = [];
  childTools.value.push(...props.tool.initChilds(toolFinder))

  if (childTools.value.length) {
    nextTick().then(() => onDropAreaChange({mounted:{element:props.tool}}))
  }
};

const addItem = (type) => {
  showNewPropertyDialogAndGetTool(fb?.exposed?.toolFinder, fb)
      .then(tools => {
        tools.forEach(tool => {
          childTools.value.push(tool);
          onDropAreaChange({added: {element:tool}});
        })
      })
};
const showAddItem = computed(() => {
  const isSchemaReadOnly = !!fb?.props?.schemaReadOnly;
  return !isSchemaReadOnly;
});

const onDeleteByTool = (e) => confirmAndRemoveChild(props.tool, e.tool, fb).then(e => {
  childTools.value = props.tool.edge.childs;
  onDropAreaChange(e);
});

const onDropAreaChange = (e) => prepareAndCallOnDropAreaChange(e, props.tool, childTools.value, fb?.exposed?.onDropAreaChanged);

const onDelete = () => {
  emit("deleteByTool", { tool: props.tool });
};

const showDragClass = computed(() => {
  const toolDragging = getToolDragging();
  const isCategory = 'Category' === toolDragging?.uischema?.type;

  return !isCategory && !!toolDragging;
})

</script>
