<template>

  <div class="formbuilder">


    <Modal
        :tool="toolEdit"
        :jsonFormsRenderers="jsonFormsRenderers"

        @change="onChangeModal"
        @close="isModalOpen=false;toolEdit=null"

        v-if="isModalOpen && toolEdit"
    />

    <div class="styleA" v-if="filteredBuilders.length>1">
      Builder:
      <select v-model="showBuilder" @change="onChangeBuilder" class="!w-auto !inline">
        <option v-for="builder in filteredBuilders">{{ builder }}</option>
      </select>
    </div>

    <nav>

      <div class="tabs">
        <button @click="showBar='schema';" :class="{active:'schema'===showBar}" v-if="!schemaReadOnly">Controls</button>
        <button @click="showBar='uischema';" :class="{active:'uischema'===showBar}" v-if="showBuilder==='uischema'">Layout</button>
        <button @click="showBar='properties';" :class="{active:'properties'===showBar}" v-if="schemaReadOnly">Properties</button>
      </div>

      <FormBuilderBar
          :tools="tools"
          @drag="e=>drag = !!e"
      />

    </nav>


    <template  v-if="currentBaseTool">
      <component :is="currentBaseTool.importer()"
                 :tool="currentBaseTool"
                 :isRoot="true"
                 class="my-4"
                 :key="currentBaseTool.propertyName"
      />
    </template>

  </div>

</template>

<style scoped>
nav {
  background-color: var(--toolBar-bg);
}
.tabs {
  @apply
  flex gap-2
}
.tabs > button {
  @apply
  p-1 px-4
  rounded-t
}

.tabs > button.active {
  background-color: var(--toolBar-tab);
}

.tabs > button:hover {
 background-color: var(--toolBar-tab-hover);
}

</style>


<script setup>
import {computed, ref, unref, onMounted, onBeforeUnmount, onBeforeMount} from 'vue'
import {
  FormBuilderBar,
  createJsonForms,
  emitter,
  cloneToolWithSchema,
  createTypeObjectSchema,
  findAllProperties,
  findAllScopes, createBaseTool, createDefTool, createSchemaTool,
} from "../index";
import Modal from "./Modal.vue";
import {useJsonforms} from "../composable/jsonforms";
import {normalizePath, normalizeScope} from "../lib/normalizer";
import _ from "lodash";
import {objectTool} from "../lib/tools/ObjectTool";
import {generateDefaultUISchema} from "@jsonforms/core/src/generators/uischema";
import {generateJsonSchema} from "@jsonforms/core";
import {getFormbuilder, onDragGetTool} from "../lib/vue";
import {ToolFinder} from "../lib/ToolFinder";

const props = defineProps({
  jsonForms: Object,
  jsonFormsRenderers: Array,
  schemaReadOnly: Boolean,
  tools: Array,
  builders: Array,
  initBuilder: String,
})

const emit = defineEmits(['schemaUpdated']);

const drag = ref(false);
const jsonFormsUiSchema = ref(props?.jsonForms?.uischema);
const jsonFormsSchema = ref(props?.jsonForms?.schema);
const isModalOpen = ref(false);
const toolEdit = ref(null);
const showBuilder = ref('uischema');
const showBar = ref('schema');


//expose
const toolFinder = new ToolFinder(props.tools);
const toolDragging = ref();
const onToolDrag = (e) => toolDragging.value = onDragGetTool(e);
defineExpose({toolFinder, showBuilder, toolDragging, onToolDrag})


const filteredBuilders = computed(() => {
  const showBuilders = props.builders;
  const allowedBuilders = ['schema','uischema','definitions'];
  return showBuilders ? showBuilders.filter(value => allowedBuilders.includes(value)) : allowedBuilders;
})

const {update, schema: rootSchema, uischema: rootUischema} = useJsonforms();

//update(props.jsonForms?.schema, props.jsonForms?.uischema);


//:TODO there is a lot of renderings - how to optimize?
// onRenderTriggered((e) => {
//   console.log("FB.onRenderTriggered",e);
// });

const onChangeBuilder = (e) => {
  switch (e.target.value) {
    case 'schema':
      showBar.value='schema';

      baseSchemaTool.value = createSchemaTool(rootSchema.value);
      currentBaseTool.value = baseSchemaTool.value;
      break;

    case 'uischema':
      showBar.value='schema';

      //:TODO add property & scope changed check!

        if(props.schemaReadOnly) {
          baseUiTool.value = createBaseTool(toolFinder);
        }
        else {
          baseUiTool.value = createBaseTool(toolFinder, rootSchema.value, rootUischema.value);
        }

      currentBaseTool.value = baseUiTool.value;
      break;

    case 'definitions':
      showBar.value='schema';

      baseDefinitionTool.value = createDefTool(rootSchema.value);
      currentBaseTool.value = baseDefinitionTool.value
      break;
  }
}

const baseUiTool = ref(null);
const baseSchemaTool = ref(null);
const baseDefinitionTool = ref(null);
const currentBaseTool = ref(null);

const tools = computed(() => {

  let all = [];

  switch (showBar.value) {
    case 'properties':
      return readonlyTools.value;

    case 'schema':
      all = toolFinder.findControlTools();
      break;

    case 'uischema':
      all = toolFinder.findLayoutTools();
      break;
  }

  all = all.filter(tool => !tool.toolbarOptions()?.hideToolAtBar);

  return all;
});

const readonlyTools = computed(() => {

  let all = [];


  //:TODO find better solution!! use toolStore
  if(props.schemaReadOnly) {

    const {schema, uischema} = useJsonforms();

    const usedProps = findAllScopes(rootUischema.value).map(scope=>normalizePath(normalizeScope(scope)));

    const allProps = findAllProperties(rootSchema.value);
    const readOnlyControlTools = Object.keys(allProps)?.map(name => {

      const itemSchema = allProps[name];
      const itemUischema = {type:'Control',scope:'#'};

      const clone = cloneToolWithSchema(toolFinder.findMatchingTool(rootSchema, itemSchema, itemUischema),  itemSchema, itemUischema)
      clone.propertyName = name;

      return clone;
    }).filter(tool => !usedProps.includes(tool.propertyName))

    all = [...readOnlyControlTools, ...all]
  }

  return all;
});

const onChangeModal = (data) => {
  if (toolEdit.value) {
    // if(data.propertyName) {
    //   toolEdit.value.props.propertyName = data.propertyName;
    // }
    updateJsonForm();
  }
}

const updateJsonForm = () => {
  switch (showBuilder.value) {
    case 'schema':
      updateSchemaBuilder();
      break;

    case 'definitions':
      updateDefinitionBuilder();
      break;

    default:
      updateUischemaBuilder();
      break;
  }
}

const updateSchemaBuilder = () => {
  if (baseSchemaTool?.value) {
    const r = createTypeObjectSchema(baseSchemaTool.value);


    //:DEV composables with sub-formbuilder does not work!!
    //update(r.schema, rootUischema.value)
    emit('schemaUpdated', {schema:r.schema, uischema:rootUischema.value})
  }
}


const updateDefinitionBuilder = () => {
  if (baseDefinitionTool?.value) {
    const def = createTypeObjectSchema(baseDefinitionTool.value);
    console.log("def",def);

    if (!_.isEmpty(def.definitions?.properties ?? {})) {
      const updatedSchema = rootSchema.value
      updatedSchema.definitions = def.definitions.properties;

      update(updatedSchema, rootUischema.value)
      emit('schemaUpdated', {schema:updatedSchema, uischema:rootUischema.value})
    }
  }
}

const updateUischemaBuilder = () => {
  let newJsonForms;

  if ('definition' === showBuilder.value) {
    const def = createTypeObjectSchema(baseDefinitionTool.value);
    newJsonForms = {
      schema: jsonFormsSchema.value,
      uischema: jsonFormsUiSchema.value,
    }
    if (!_.isEmpty(def.definitions?.properties ?? {})) {
      newJsonForms.schema.definitions = def.definitions.properties;
    }
    else {
      delete newJsonForms.schema.definitions;
    }
  }

  if ('uischema' === showBuilder.value) {
    newJsonForms = createJsonForms(baseUiTool.value, jsonFormsSchema.value, props.schemaReadOnly);
    jsonFormsSchema.value = newJsonForms.schema;
    jsonFormsUiSchema.value = newJsonForms.uischema;
  }

  if (newJsonForms) {
    update(jsonFormsSchema.value, jsonFormsUiSchema.value)
    emit('schemaUpdated', newJsonForms)
  }

  //emitter.emit('formBuilderSchemaUpdated', newJsonForms)
}


// const rootForm = ref(null);
// const rootDefinitionForm = ref(null);
// const rootSchemaForm = ref(null);
// const setRootForm = (e) => rootForm.value = e
// const setRootDefinitionForm = (e) => rootDefinitionForm.value = e
// const setRootSchemaForm = (e) => rootSchemaForm.value = e

onBeforeMount(() => {
  const fb = getFormbuilder();
  console.log("FB.onBeforeMount", "root fb", fb)

  //init baseTool
  showBuilder.value = props.initBuilder ?? 'uischema';
  update(props?.jsonForms?.schema, props?.jsonForms?.uischema)
  onChangeBuilder({target:{value:showBuilder.value}})
  if(props.schemaReadOnly) {
    showBar.value='properties';
  }

  const updateJsonFormDebounced = _.debounce(() => {
    window.setTimeout(updateJsonForm, 100);
  },100,{leading:false, trailing:true})

  //trigger update if there are no elements (that would emit 'formBuilderUpdated')
  const hasElements = (props.jsonForms?.uischema?.elements?.length ?? 0) > 0;
  if(!hasElements) {
    updateJsonForm();
  }

  emitter.on('formBuilderModal', (data) => {
    isModalOpen.value = true;
    toolEdit.value = data.tool;
  })
  emitter.on('formBuilderUpdated', (data) => {
    updateJsonFormDebounced();
  });
});
onBeforeUnmount(() => {
  emitter.off('formBuilderModal');
  emitter.off('formBuilderUpdated');
})

</script>

