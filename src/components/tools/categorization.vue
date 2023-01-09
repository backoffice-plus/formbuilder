<template>
  <div class="relative">

    <ElementHeadOrToolIcon :uuid="uuid" :tool="tool" :toolType="toolType" :properties="data" />

    <div v-if="!tool" class="mr-5">

      <Actions :uuid="uuid" @gear="openModal" @delete="onDelete" />

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
          @change="onUpdated"
      >
        <template #item="{ element: tool, index }">
          <div> <!-- div needed for edit mode?!?! -->
            <component :is="importComponent(tool.componentName)"
                       :toolProps="tool.props"
                       :uuid="tool.uuid"

                       :index="index"
                       :tool="false"

                       :isDragging=isDragging

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
  getComponent, findLayoutTool, getChildComponents, initElementsByToolProps,
  updatableUischemaKeys,
    emitter
} from "../../index";

export default {
  components: {draggableComponent, ElementHeadOrToolIcon, Actions},

  props: {
    toolProps: ToolProps,
    uuid: String,
    tool: Boolean,
    index: Number, //needed?

    isDragging: Boolean,
  },

  data() {
    return {
      dragTab: false,

      toolType: this?.toolProps?.toolType,

      elements: [],
      data: {},

      tabs:[],
      currentTab: -1,
      tabLabels:{},
    };
  },


  mounted() {
    if (!this.tool) {
      if (this.toolProps.jsonForms?.uischema?.elements?.length) {
        initElementsByToolProps(this.toolProps)
            .map(elm => this.elements.push(elm));

        //wait to render dom
        setTimeout(this.onUpdated, 100);
      }
      else {
        this.addTab();
      }

      if(this.toolProps) {
        updatableUischemaKeys.forEach(key => {
          if(this.toolProps.jsonForms?.uischema[key]) {
            this.data[key] = this.toolProps.jsonForms.uischema[key];
          }
        });
      }
    }
  },
  methods: {

    importComponent(componentName) {
      return getComponent(componentName);
    },

    addTab: function() {
      const tool = findLayoutTool(undefined,{type: 'Category'});
      tool.props.jsonForms.uischema.label = 'Tab';
      this.elements.push(tool);
      window.setTimeout(this.buildTabLabels,50);
    },
    openModal() {
      emitter.emit('formBuilderModal', {uuid:this.uuid, data:this.data, type:this.toolProps.jsonForms.uischema?.type})
    },
    onDelete() {
      if(confirm("Wirklich löschen?")) {
        this.$emit('deleteByIndex', {index: this.index});
      }
    },

    onDeleteByIndex(e) {
      const index = e.index;
      this.elements.splice(index, 1);

      this.onUpdated();
    },

    buildTabLabels: function (e) {
      const childs = getChildComponents(this);
      Object.keys(childs).map(uuid => {
        if(childs[uuid]?.toolProps.jsonForms.uischema.label) {
          this.tabLabels[uuid] = childs[uuid].toolProps.jsonForms.uischema.label;
        }
      });
      console.log("lables",this.tabLabels);
    },

    onUpdated(e) {
      console.log("categorization onUpdated");
      window.setTimeout(this.buildTabLabels,50);
      emitter.emit('formBuilderUpdated', e)
    },
  },

  /**
   * HIER WEITER!!!
   * after changing tab label, the internal tab also needs to be renamed!!
   * but no event is triggered!
   */
  watch: {
    data: {
      handler() {
        console.log("categorization watch.data");
        this.toolProps.jsonForms.update({...this.data});
        this.onUpdated();
      },
      deep: true
    },
  },
};

</script>
