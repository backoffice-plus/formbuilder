<template>
  <div class="flexAreaTool">

    <ElementHeadOrToolIcon :isToolbar="isToolbar" :tool="tool" />

    <div v-if="!isToolbar" :class="{'mr-5':!isRoot}">

      <Actions :tool="tool" @delete="onDelete" v-if="!isRoot" />

      <draggableComponent
        :class="['dropArea bg-dotted nestedFlexArea', toolType, {drag:isDragging||drag}]"
        :list="elements"
        group="formBuilder"
        item-key="uuid"
        @start="drag = true"
        @end="drag = false"
        @change="onDropAreaChange"
      >
        <template #item="{ element: tool, index }">
          <div> <!-- div needed for edit mode?!?! -->
            <component :is="importComponent(tool.componentName)"

                       :tool="tool"
                       :isToolbar="false"
                       :isDragging=!!(isDragging||drag)
                       :index="index"

                       @deleteByIndex="onDeleteByIndex"

                       class="dropItem"
                       :ref="'components '+ tool.uuid"
            />
          </div>
        </template>
      </draggableComponent>
    </div>
  </div>
</template>

<style>

.flexAreaTool {
  @apply relative;
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
.nestedFlexArea:not(.flexRow) {
   @apply
   flex-col
}
.nestedFlexArea.flexRow {
  @apply
  flex-row
}
.nestedFlexArea > * {
  @apply w-full
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

  bg-blue-100
  border border-blue-200
  p-4
  rounded
}


</style>

<script>
//import draggableComponent from 'vuedraggable'
import * as draggableComponent from 'vuedraggable'
import {
  ElementHeadOrToolIcon, Actions,
  initElementsByToolProps, getComponent,
  emitter
} from "../../index";
import {Tool} from "../../lib/models";

/**
 * @see https://sortablejs.github.io/vue.draggable.next/#/clone-on-control
 */
export default {
  components: {Actions, ElementHeadOrToolIcon, draggableComponent},

  props: {
    tool: Tool,
    isRoot: Boolean,
    isToolbar: Boolean,
    index: Number, //for deleting correct element in list

    isDragging: Boolean,
  },
  //props: ['toolType', 'uuid', 'index', 'type', 'jsonForms', 'edit', 'options'],

  data() {
    return {
      drag: false,

      uuid: this.tool?.uuid,
      toolProps: this.tool?.props,
      toolType: this?.tool?.props?.toolType,

      elements: [],
    };
  },

  // computed: {
  //   flexType() {
  //     return 'nestedFlexArea ' + ('flexRow' === this.toolType ? 'flex-row' : 'flex-col');
  //   },
  // },

  mounted() {
    if (!this.isToolbar) {
      this.init();
    }
  },

  methods: {
    init() {
      this.elements = [];
      this.toolProps && initElementsByToolProps(this.toolProps)
          .map(elm => this.elements.push(elm));

      if(this.elements.length)  {
        //wait to render dom
        setTimeout(this.onDropAreaChange, 50);
      }
    },

    importComponent(componentName) {
      return getComponent(componentName);
    },

    onDelete() {
      if(confirm("Wirklich löschen?")) {
        this.$emit('deleteByIndex', {index: this.index});
      }
    },

    onDeleteByIndex(e) {
      const index = e.index;
      this.elements.splice(index, 1);

      this.onDropAreaChange(e);
    },

    onDropAreaChange(e) {
      emitter.emit('formBuilderUpdated', e)
    },
  },

  watch: {
    // data: {
    //   handler() {
    //     console.log("flexarea watch data DEPRECATED!!!")
    //     this.toolProps.jsonForms.update({...this.data});
    //     this.onDropAreaChange();
    //   },
    //   deep: true
    // },
  }
};

</script>
