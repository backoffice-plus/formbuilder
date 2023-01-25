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

                 :tool="tool"
                 :isToolbar="true"

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

  overflow-x-auto
}

aside::-webkit-scrollbar {
  width: 4px;
}
aside::-webkit-scrollbar-track {
  @apply bg-gray-200
}
aside::-webkit-scrollbar-thumb {
  border-width: 6px;
  @apply
  rounded-full
  border-solid border-gray-200
  bg-gray-500
  hover:bg-opacity-80
  active:bg-opacity-50
}

aside .toolItem {
  min-width: 80px;
  @apply
  cursor-move

  h-10 w-20

  overflow-hidden

  bg-blue-100

  bg-opacity-100
  hover:bg-opacity-80

  border border-gray-500

  rounded
  shadow

  flex items-center justify-center

  text-xs leading-none text-center
}
aside .toolItem.formInputByTypeTool {
   @apply
  bg-blue-200
}

</style>

<script>

/**
 * @see https://sortablejs.github.io/vue.draggable.next/#/clone-on-control
 */
import {defineComponent, onBeforeUnmount, onMounted} from 'vue';
import * as draggableComponent from 'vuedraggable'
import {
  importToolComponent,
  layoutTools,
  controlTools,
  findAllProperties,
  emitter,
  findAllScopes,
  ToolProps
} from "../index";
import {guessInputType, normalizeScope, normalizePath} from '../lib/normalizer'
import {Tool} from "../lib/models";

export default defineComponent({
  components: {draggableComponent},

  props: {
    schemaReadOnly: {type:Boolean, default: false},
    jsonForms: {type:Object, default: {}},
  },

  data() {
    return {
      drag: false,
      cloneCounter: {},
      usedProps: [],
    };
  },

  mounted() {
    emitter.on('formBuilderSchemaUpdated', (jsonForms) => {
      this.usedProps = findAllScopes(jsonForms.uischema).map(scope=>normalizePath(normalizeScope(scope)))
    });
  },
  //
  // beforeUnmount() {
  //   emitter.off('formBuilderSchemaUpdated');
  // },

  computed: {
    schema() {
      return this.jsonForms?.schema;
    },
    tools() {
      let all = [...layoutTools];
      if(this.schemaReadOnly) {
        const allProps = findAllProperties(this.schema);
        const readOnlyControlTools = Object.keys(allProps)?.map(name => {

          //const tool = findControlTool(allProps[name], {}).clone();
          // tool.props.propertyName = name;
          // tool.props.schemaReadOnly = true;
          const tool = new Tool('formInputByType', ToolProps.create({
            propertyName: name,
            toolType: 'control',
            toolName: 'Control',
            schemaReadOnly: true,
            jsonForms: {schema:allProps[name], uischema:{type:'Control'}}
          }));

          return tool;
        }).filter(tool => !this.usedProps.includes(tool.props.propertyName))

        all = [...readOnlyControlTools, ...all]
      }
      else {
        all = [...controlTools, ...all]
      }

      return all;
    },

  },

  methods: {
    importComponent(componentName) {
      return importToolComponent(componentName);
    },
    onChoose(e) {
      //console.log("onChoose",e)
    },
    onDrag(drag) {
      this.$emit('drag', drag);
    },

    clone(tool) {
      const clone = tool.clone();

      if('Control' === tool.props.jsonForms.uischema.type) {
        const inputType = guessInputType(tool.props.jsonForms)
        if(this.cloneCounter[inputType] === undefined) {
          this.cloneCounter[inputType] = 0;
        }
        const counter = ++this.cloneCounter[inputType];

        if(!this.schemaReadOnly) {
          clone.props.propertyName = inputType + (counter);
          clone.props.jsonForms.uischema.label = inputType;
        }
      }

      //rootSchema
      clone.props.jsonForms.rootSchema = this.jsonForms?.schema

      return clone;
    },
  }
})

</script>

