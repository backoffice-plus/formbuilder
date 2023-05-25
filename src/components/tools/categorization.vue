<template>
  <div class="categorizationTool" :class="['rootItem', {isRoot:isRoot}]">

    <slot name="header">
      <ToolIcon :tool="tool" :isToolbar="isToolbar">

      </ToolIcon>
    </slot>

    <div v-if="!isToolbar" class="mr-5">

      <Actions :tool="tool" @delete="onDelete" :deletable="!isRoot">
        <button type="button" @click="collapsed=!collapsed;"><Icon :icon="collapsed ? 'mdi:arrow-expand-vertical' : 'mdi:arrow-collapse-vertical'" v-if="!isRoot" /></button>
      </Actions>

      <div class="flex items-center" v-show="!collapsed">
        <div class="tabs">
          <button
              v-for="(element,index) in childTools"
              :class="{selected:currentTab===index}"
              @click="currentTab=index"
          >
            {{ element.uischema.label }}
          </button>
          <button
            @click="currentTab=-1"
            v-text="'All'"
            v-if="currentTab>=0 && childTools.length>1"
          />
          <button type="button" class="add" @click="addTab"><Icon icon="mdi:plus" /></button>
        </div>
      </div>

      <Vuedraggable
          v-bind="vuedraggableOptions"

          :class="['dropArea nestedFlexArea flex-col', {drag:showDragClass}]"
          :list="childTools"
          group="formBuilderCategorization"
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

                       v-show="currentTab===-1 || index===currentTab"
            />
          </div>
        </template>
      </Vuedraggable>

    </div>
  </div>
</template>



<style scoped>

.categorizationTool:not(.isRoot) {
  background-color: var(--tool-layout);
}
.categorizationTool {
  @apply
  relative
}

.tabs {
  @apply
  flex gap-2
  my-0 mt-2
}
.tabs button:not(.add) {
  min-width: 100px;
  @apply
  py-1

  focus:outline-none

  transition-colors

  rounded-t-lg
}

.tabs button:not(.add):hover {
  background-color: var(--tool-categorization-tab-hover);
}

.tabs button.add {
  @apply
  w-8 aspect-square
  rounded-full

  flex items-center justify-center
}
.tabs button.add:hover {
  background-color: var(--tool-categorization-tab-hover);
}
</style>


<script setup>
/**
 * @see https://sortablejs.github.io/vue.draggable.next/#/clone-on-control
 */
import {deleteToolInChilds} from "../../lib/formbuilder";
import {toolComponentProps, vuedraggableOptions} from "../../lib/models";
import Actions from "./utils/Actions.vue";
import {default as Vuedraggable} from "../../../packages/_vuedraggable/src/vuedraggable.js";
import {ref, computed, onMounted, nextTick} from 'vue';
import {unknownTool} from "../../lib/tools/unknownTool";
import ToolIcon from "./utils/ToolIcon.vue";
import {Icon} from "@iconify/vue";
import {getFormbuilder, getToolDragging, getToolfinder} from "../../lib/vue";
import {cloneEmptyTool} from "../../lib/toolCreation";

const props = defineProps({...toolComponentProps()})

const emit = defineEmits(['deleteByTool']);

const childTools = ref([]);
const tabs = ref([]);
const currentTab = ref(-1);
const collapsed = ref(false);

const fb = getFormbuilder();
const toolFinder = getToolfinder();
const onDrag = fb?.exposed.onToolDrag;

onMounted(() => {
  if (!props.isToolbar) {
    if (props?.tool?.uischema?.elements?.length) {
      childTools.value.push(...props.tool.initChilds(toolFinder));

      if (childTools.value.length) {
        nextTick().then(() => onDropAreaChange({mounted:{element:props.tool}}))
      }
    }
    else {
      addTab();
    }
  }
})


// const init = () => {
//   childTools.value = [];
//   childTools.value.push(...initElements(props.tool))
//
//   if (childTools.value.length) {
//     //wait to render dom (:TODO use nextTick)
//     setTimeout(onDropAreaChange, 50);
//   }
// };


const addTab = () => {
  const tabTool = cloneEmptyTool(toolFinder.findLayoutToolByUiType('Category') ?? unknownTool);
  tabTool.uischema.label = 'Tab';

  childTools.value.push(tabTool);
  onDropAreaChange({added: {element:tabTool}});
};


const onDropAreaChange = (e) => {
  props.tool.childs = childTools.value;
  fb?.exposed?.onDropAreaChanged(e);
};

const onDeleteByTool = async (e) => {
  e.tool && deleteToolInChilds(e.tool, childTools.value)
      .then(newChildTools => {
        childTools.value = newChildTools;
        onDropAreaChange({removed: {element:e.tool}});
      })
};

const onDelete = () => {
  emit("deleteByTool", { tool: props.tool });
};

const showDragClass = computed(() => {
  const toolDragging = getToolDragging();
  const isCategory = 'Category' === toolDragging?.uischema?.type;
  return isCategory
})

</script>
