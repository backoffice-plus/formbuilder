<template>
  <div class="categorizationTool" :class="['rootItem', {isRoot:isRoot}]">

    <ToolIcon :tool="tool" :isToolbar="isToolbar">

    </ToolIcon>

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
          :class="['dropArea nestedFlexArea flex-col', {drag:showDragClass}]"
          :list="childTools"
          group="formBuilderCategorization"
          item-key="uuid"
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
                       :index="index"

                       @deleteByIndex="onDeleteByIndex"

                       class="dropItem"
                       :ref="addChildComponent"

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
import {cloneEmptyTool} from "../../lib/formbuilder";
import {initElements} from "../../lib/initializer";
import {  emitter} from "../../lib/mitt";
import Actions from "./utils/Actions.vue";
import {Vuedraggable} from '../../index'
import {ref, computed, onMounted} from 'vue';
import {useTools} from "../../composable/tools";
import {unknownTool} from "../../lib/tools/unknownTool";
import ToolIcon from "./utils/ToolIcon.vue";
import {Icon} from "@iconify/vue";
import {useFormbuilder} from "../../composable/formbuilder";

const props = defineProps({
  tool: Object,//ToolInterface,
  isRoot: Boolean,
  isToolbar: Boolean,
  index: Number, //for deleting correct element in list
})

const emit = defineEmits(['deleteByIndex']);

const {onDrag, toolDragging} = useFormbuilder();

const childTools = ref([]);
const childComponents = ref({});
const tabs = ref([]);
const currentTab = ref(-1);
const collapsed = ref(false);

const addChildComponent = (e) => {
  if(e?.tool?.uuid) {
    childComponents.value[e.tool.uuid]=e;
  }
}

//defineExpose({ tool:props.tool, childTools:childTools, childComponents:childComponents })

onMounted(() => {
  if (!props.isToolbar) {
    if (props?.tool?.uischema?.elements?.length) {
      childTools.value.push(...initElements(props.tool));

      //wait to render dom
      if(childTools.value.length) {
        setTimeout(onDropAreaChange, 20);
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
  const {findLayoutToolByUiType} = useTools();

  const tabTool = cloneEmptyTool(findLayoutToolByUiType('Category') ?? unknownTool);
  tabTool.uischema.label = 'Tab';

  childTools.value.push(tabTool);
  onDropAreaChange(null);
};


const onDropAreaChange = (e) => {
  props.tool.childs = childTools.value;
  emitter.emit('formBuilderUpdated')
};

const onDeleteByIndex = (e) => {
  const index = e.index;
  const toolDeleted = childTools.value[index];

  childTools.value.splice(index, 1);
  delete childComponents.value[toolDeleted.uuid];

  emitter.emit('formBuilderUpdated')
};

const onDelete = () => {
  Promise.resolve(window.confirm("Wirklich l??schen?"))
      .then((confirmed) => {
        if(confirmed) {
          emit("deleteByIndex", { index: props.index });
        }
      });
};

const showDragClass = computed(() => {
  const isCategory = 'Category' === toolDragging.value?.uischema?.type;
  return isCategory
})

</script>
