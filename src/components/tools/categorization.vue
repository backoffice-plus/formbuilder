<template>
  <div class="categorizationTool" :class="['group/itemC']">

    <ElementHeadOrToolIcon :isToolbar="isToolbar" :tool="tool" />

    <div v-if="!isToolbar" class="mr-5">

      <Actions :class="['opacity-0', 'group-hover/itemC:opacity-100']" :tool="tool" @delete="onDelete" />

      <div class="flex items-center">
        <div class="tabs">
          <button
              v-for="(element,index) in elements"
              :class="{selected:currentTab===index}"
              @click="currentTab=index"
          >
            {{ tabLabels[element.uuid] ?? 'Tab' }}
          </button>
          <button
            @click="currentTab=-1"
            v-text="'All'"
            v-if="currentTab>=0 && elements.length>1"
          />
          <button type="button" class="add" @click="addTab" />
        </div>
      </div>

      <draggableComponent
          :class="['dropArea bg-dotted nestedFlexArea flex-col', {drag:dragTab}]"
          :list="elements"
          group="formBuilderCategorization"
          item-key="uuid"
          @start="dragTab = true"
          @end="dragTab = false"
          @change="onDropAreaChange"
      >
        <template #item="{ element: tool, index }">
          <div> <!-- div needed for edit mode?!?! -->
            <component :is="importComponent(tool.componentName)"

                       :tool="tool"
                       :isToolbar="false"
                       :isDragging=isDragging
                       :index="index"

                       @deleteByIndex="onDeleteByIndex"

                       class="dropItem"
                       :ref="'components '+ tool.uuid"

                       v-show="currentTab===-1 || index===currentTab"
            />
          </div>
        </template>
      </draggableComponent>

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



<script>
//import draggableComponent from 'vuedraggable'
import * as draggableComponent from 'vuedraggable'
import {
  ElementHeadOrToolIcon, Actions,
  ToolProps,
  importToolComponent, findLayoutTool, getChildComponents, initElementsByToolProps,
  updatableUischemaKeys,
    emitter
} from "../../index";
import {Tool} from "../../lib/models";

export default {
  components: {draggableComponent, ElementHeadOrToolIcon, Actions},

  props: {
    tool: Tool,
    isToolbar: Boolean,
    index: Number, //for deleting correct element in list

    isDragging: Boolean,
  },

  data() {
    return {
      dragTab: false,


      uuid: this.tool.uuid,
      toolProps: this.tool?.props,
      toolType: this?.toolProps?.toolType,

      elements: [],

      tabs:[],
      currentTab: -1,
      tabLabels:{},
    };
  },


  mounted() {
    if (!this.isToolbar) {
      if (this.toolProps.jsonForms?.uischema?.elements?.length) {
        initElementsByToolProps(this.toolProps)
            .map(elm => this.elements.push(elm));

        //wait to render dom
        if(this.elements.length) {
          setTimeout(this.onDropAreaChange, 20);
        }
      }
      else {
        this.addTab();
      }

      emitter.on('formBuilderUpdated', (data) => {
        window.setTimeout(this.buildTabLabels,20);
      });
    }
  },
  methods: {

    importComponent(componentName) {
      return importToolComponent(componentName);
    },

    addTab: function() {
      const tool = findLayoutTool(undefined,{type: 'Category'});
      tool.props.jsonForms.uischema.label = 'Tab';
      this.elements.push(tool);
      window.setTimeout(this.buildTabLabels,50);
    },
    onDelete() {
      if(confirm("Wirklich löschen?")) {
        this.$emit('deleteByIndex', {index: this.index});
      }
    },

    onDeleteByIndex(e) {
      const index = e.index;
      this.elements.splice(index, 1);

      emitter.emit('formBuilderUpdated')
    },

    buildTabLabels: function (e) {
      const childs = getChildComponents(this);
      Object.keys(childs).map(uuid => {
        if(childs[uuid]?.toolProps.jsonForms.uischema.label) {
          this.tabLabels[uuid] = childs[uuid].toolProps.jsonForms.uischema.label;
        }
      });
    },

    onDropAreaChange(e) {
      window.setTimeout(this.buildTabLabels,50);
      emitter.emit('formBuilderUpdated')
    },
  },

  beforeUnmount() {
    emitter.off('formBuilderUpdated')
  }
};

</script>
