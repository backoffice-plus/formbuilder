<template>
  <div class="categorizationTool" :class="['group/itemC']">

    <ElementHeadOrToolIcon :isToolbar="isToolbar" :tool="tool" />

    <div v-if="!isToolbar" class="mr-5">

      <Actions :class="['opacity-0', 'group-hover/itemC:opacity-100']" :tool="tool" @delete="onDelete" />

      <div class="flex items-center">
        <div class="tabs">
          <button
              v-for="(element,index) in childTools"
              :class="{selected:currentTab===index}"
              @click="currentTab=index"
          >
            {{ tabLabels[element.uuid] ?? 'Tab' }}
          </button>
          <button
            @click="currentTab=-1"
            v-text="'All'"
            v-if="currentTab>=0 && childTools.length>1"
          />
          <button type="button" class="add" @click="addTab" />
        </div>
      </div>

      <Vuedraggable
          :class="['dropArea bg-dotted nestedFlexArea flex-col', {drag:dragTab}]"
          :list="childTools"
          group="formBuilderCategorization"
          item-key="uuid"
          @start="dragTab = true"
          @end="dragTab = false"
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

                       v-show="currentTab===-1 || index===currentTab"
            />
          </div>
        </template>
      </Vuedraggable>

    </div>
  </div>
</template>



<style scoped>

.categorizationTool {
  @apply relative;
}

.tabs {
  @apply my-0
}


.tabs {
  @apply
  flex

  my-2

  border-b border-gray-200
}

.tabs button:not(.add) {
  min-width: 100px;
  @apply
  py-1

  focus:outline-none

  border-b border-transparent

  transition-colors

  rounded-t-lg

  hover:bg-sky-400
  hover:bg-opacity-10
  hover:text-sky-800
}

.tabs button.selected {
  @apply
  text-sky-800
  border-sky-800
}


button.add::before {
  content: '';
  width: 20px;
  height: 20px;
  background-size: cover;
  display: block;
  /* mdi:tab-plus */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/></svg>');
}
</style>


<script setup>
/**
 * @see https://sortablejs.github.io/vue.draggable.next/#/clone-on-control
 */
import {
  ElementHeadOrToolIcon, Actions,
  initElementsByToolProps,
  emitter
} from "../../index";
import Vuedraggable from 'vuedraggable'
import {normalizeModalOptions} from '../../lib/normalizer'
import {ref, computed, onMounted} from 'vue';
import {Tool} from "../../lib/models";
import {useTools} from "../../composable/tools";
import {unknownTool} from "../../lib/tools/unknownTool";

const props = defineProps({
  tool: Tool,
  isRoot: Boolean,
  isToolbar: Boolean,
  index: Number, //for deleting correct element in list

  isDragging: Boolean, //needed in flexarea
})

const emit = defineEmits(['deleteByIndex']);

const drag = ref(false);
const dragTab = ref(false);
const childTools = ref([]);
const toolProps = ref( props?.tool?.props);
const toolType = ref( props?.tool?.props?.toolType);
const childComponents = ref({});
const tabs = ref([]);
const currentTab = ref(-1);
const tabLabels = ref({});


const data = computed(() => {
  return !props.isToolbar ? normalizeModalOptions(props.tool) : {};
});

const addChildComponent = (e) => {
  if(e?.tool?.uuid) {
    childComponents.value[e.tool.uuid]=e;
  }
}

defineExpose({ tool:props.tool, childTools:childTools, childComponents:childComponents })

onMounted(() => {
  if (!props.isToolbar) {
    if (props?.tool?.props.jsonForms?.uischema?.elements?.length) {
      initElementsByToolProps(props?.tool?.props)
          .map(elm => childTools.value.push(elm));

      //wait to render dom
      if(childTools.value.length) {
        setTimeout(onDropAreaChange, 20);
      }
    }
    else {
      addTab();
    }

    emitter.on('formBuilderUpdated', (data) => {
      window.setTimeout(buildTabLabels,20);
    });
  }
})


const init = () => {
  childTools.value = [];
  props?.tool?.props && initElementsByToolProps(props?.tool?.props)
      .map(elm => childTools.value.push(elm));

  if (childTools.value.length) {
    //wait to render dom (:TODO use nextTick)
    setTimeout(onDropAreaChange, 50);
  }
};


const addTab = () => {
  const {findLayoutToolByUiType} = useTools();
  const tabTool = (findLayoutToolByUiType('Category') ?? unknownTool).clone(undefined, {type: 'Category'}, undefined)

  tabTool.props.jsonForms.uischema.label = 'Tab';
  childTools.value.push(tabTool);
  window.setTimeout(buildTabLabels,50);
};


const buildTabLabels = (e) => {
  Object.keys(childComponents).map(uuid => {
    if(childComponents[uuid]?.tool?.toolProps.jsonForms.uischema.label) {
      tabLabels.value[uuid] = childComponents[uuid].tool?.toolProps.jsonForms.uischema.label;
    }
  });
};


const onDropAreaChange = (e) => {
  window.setTimeout(buildTabLabels,50);
  emitter.emit('formBuilderUpdated')
};

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
