<template>

  <draggableComponent
    tag="aside"
    :list="tools"
    :group="{name:'formBuilder', pull: 'clone', put: false}"
    :clone="clone"
    :sort="false"
    drag-class="dragging"
    @choose="onChoose"
    @start="onDrag(true)"
    @end="onDrag(false)"
    item-key="uuid"
  >
    <template #item="{ element: tool }">
      <component :is="importComponent(tool.componentName)"
                 :toolProps="tool.props"
                 :tool="true"
                 class="toolItem"
      />
    </template>

  </draggableComponent>

</template>


<style scoped>

aside {
  @apply
  flex space-x-2
  w-full
  bg-gray-200
  rounded
  p-2
}

aside .toolItem {
  @apply
  cursor-move

  h-10 w-20

  overflow-hidden

  bg-gray-400

  bg-opacity-100
  hover:bg-opacity-80

  border border-gray-500

  rounded
  shadow

  flex items-center justify-center

  text-xs leading-none text-center
}

</style>

<script>

/**
 * @see https://sortablejs.github.io/vue.draggable.next/#/clone-on-control
 */
import {defineComponent} from 'vue';
import * as draggableComponent from 'vuedraggable'
import {
  getComponent, layoutTools, controlTools
} from "../index";

export default defineComponent({
  components: {draggableComponent},

  data() {
    return {
      drag: false,
      tools: [...controlTools, ...layoutTools],
      cloneCounter: {},
    };
  },

  methods: {
    importComponent(componentName) {
      return getComponent(componentName);
    },
    onChoose(e) {
      //console.log("onChoose",e)
    },
    onDrag(drag) {
      this.$emit('drag', drag);
    },

    clone(tool) {
      const clone = tool.clone();

      if(tool.props.inputType) {
        if(this.cloneCounter[tool.props.inputType] === undefined) {
          this.cloneCounter[tool.props.inputType] = 0;
        }
        const counter = ++this.cloneCounter[tool.props.inputType];

        clone.props.propertyName = tool.props.inputType + (counter);
        clone.props.jsonForms.uischema.label = tool.props.inputType;
      }

      return clone;
    },
  }
})

</script>

