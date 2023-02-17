<template>

  <div class="">


    <Modal
        :tool="toolEdit"
        :jsonFormsRenderers="jsonFormsRenderers"
        :schemaReadOnly="schemaReadOnly"

        @change="onChange"
        @close="isModalOpen=false;toolEdit=null"

        v-if="isModalOpen && toolEdit"
    />

    <div class="tabs">
      <button @click="showBuilder='uischema';showBar='uischema';" :class="{active:'uischema'===showBuilder&&'uischema'===showBar}">UI Schema</button>
      <button @click="showBuilder='definitions';showBar='uischema';" :class="{active:'definitions'===showBuilder&&'uischema'===showBar}" v-if="!schemaReadOnly">Definitions</button>
      <button @click="showBuilder='uischema';showBar='properties';" :class="{active:'uischema'===showBuilder&&'properties'===showBar}" v-if="schemaReadOnly">Properties</button>
    </div>

    <FormBuilderBar
        :jsonForms="schemaReadOnly ? props.jsonForms : {}"
        :tools="'properties'===showBar ? readonlyTools : tools"
        :schemaReadOnly="!!schemaReadOnly"
        @drag="e=>drag = !!e"
    />

    <!-- UISchema -->
    <template v-if="'uischema' === showBuilder">
      <component :is="baseTool.importer()"
                 :tool="baseTool"
                 :isRoot="true"
                 :isDragging="!!drag"
                 class="my-4"
                 :ref="setRootForm"
      />
    </template>


    <!-- Definitions -->
    <template v-if="'definitions' === showBuilder">
      <component :is="baseDefinitionTool.importer()"
                 :tool="baseDefinitionTool"
                 :isRoot="true"
                 :isDragging="!!drag"
                 class="my-4"
                 :ref="setRootDefinitionForm"
      />
    </template>

  </div>

</template>

<style scoped>
.tabs {
  @apply
  flex gap-2
}
.tabs > button {
  @apply
  p-1 px-4
  rounded-t
  hover:bg-gray-200
  hover:bg-opacity-50
}

.tabs > button.active {
  @apply
  bg-gray-200
}

</style>


<script setup>
import {computed, ref, unref, onMounted, onBeforeUnmount, onBeforeMount} from 'vue'
import {
  FormBuilderBar,
  createJsonForms,
  emitter, cloneToolWithSchema, createTypeObjectSchema, findAllProperties, findAllScopes, findBaseTool,
} from "../index";
import Modal from "./Modal.vue";
import {useTools} from "../composable/tools";
import {useJsonforms} from "../composable/jsonforms";
import {normalizePath, normalizeScope} from "../lib/normalizer";
import _ from "lodash";
import {objectTool} from "../lib/tools/ObjectTool";
import {generateDefaultUISchema} from "@jsonforms/core/src/generators/uischema";
import {generateJsonSchema} from "@jsonforms/core";

const props = defineProps({
  jsonForms: Object,
  jsonFormsRenderers: Array,
  schemaReadOnly: Boolean,
  tools: Array,
})

const emit = defineEmits(['schemaUpdated']);

const rootForm = ref(null);
const rootDefinitionForm = ref(null);
const drag = ref(false);
const jsonFormsUiSchema = ref(props?.jsonForms?.uischema);
const jsonFormsSchema = ref(props?.jsonForms?.schema);
const isModalOpen = ref(false);
const toolEdit = ref(null);
const showBuilder = ref('uischema');
const showBar = ref('uischema');

const {registerTools, unregisterAllTools, findLayoutToolByUiType, findMatchingTool} = useTools();
const {getControlTools, getLayoutTools} = useTools();

const {update} = useJsonforms();
//update(props.jsonForms?.schema, props.jsonForms?.uischema);


//:TODO there is a lot of renderings - how to optimize?
// onRenderTriggered((e) => {
//   console.log("FB.onRenderTriggered",e);
// });


const baseTool = computed(() => {
  let schema = unref(jsonFormsSchema);
  let uischema = unref(jsonFormsUiSchema);

  if(undefined === schema) {
    schema = generateJsonSchema({});
  }
  if(undefined === uischema) {
    uischema = generateDefaultUISchema(schema);
  }

  return findBaseTool(schema, uischema);
})

const baseDefinitionTool = computed(() => {
  const schema = {
    type:'object',
    properties: jsonFormsSchema.value.definitions
  };
  const basetool = cloneToolWithSchema(objectTool,schema , {});
  basetool.propertyName = 'definitions';
  return basetool;
})


const tools = computed(() => {

  let all = [];

  if(!props.schemaReadOnly) {
    all.push(...getControlTools())
  }

  if('uischema' === showBuilder.value) {
    all.push(...getLayoutTools())
  }

  all = all.filter(tool => !tool.toolbarOptions()?.hideToolAtBar);

  return all;
});

const readonlyTools = computed(() => {

  let all = [];


  //:TODO find better solution!! use toolStore
  if(props.schemaReadOnly) {

    const {schema, uischema} = useJsonforms();

    const usedProps = findAllScopes(uischema.value).map(scope=>normalizePath(normalizeScope(scope)));

    const allProps = findAllProperties(schema.value);
    const readOnlyControlTools = Object.keys(allProps)?.map(name => {

      const itemSchema = allProps[name];
      const itemUischema = {type:'Control',scope:'#'};

      const clone = cloneToolWithSchema(findMatchingTool(schema, itemSchema, itemUischema),  itemSchema, itemUischema)
      clone.propertyName = name;
      clone.schemaReadOnly = true;

      return clone;
    }).filter(tool => !usedProps.includes(tool.propertyName))

    all = [...readOnlyControlTools, ...all]
  }

  return all;
});

const onChange = (data) => {
  if (toolEdit.value) {
    // if(data.propertyName) {
    //   toolEdit.value.props.propertyName = data.propertyName;
    // }
    updateJsonForm();
  }
}

const updateJsonForm = () => {

  let newJsonForms;

  if (rootDefinitionForm.value) {
    const def = createTypeObjectSchema(rootDefinitionForm);
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

  if (rootForm?.value) {
    newJsonForms = createJsonForms(rootForm, jsonFormsSchema.value, props.schemaReadOnly);
    jsonFormsSchema.value = newJsonForms.schema;
    jsonFormsUiSchema.value = newJsonForms.uischema;
  }

  if (newJsonForms) {
    update(jsonFormsSchema.value, jsonFormsUiSchema.value)
    emit('schemaUpdated', newJsonForms)
  }

  //emitter.emit('formBuilderSchemaUpdated', newJsonForms)
}

const setRootForm = (e) => rootForm.value = e
const setRootDefinitionForm = (e) => rootDefinitionForm.value = e

onBeforeMount(() => {
  unregisterAllTools();   //is that a good behavior?
  registerTools(props.tools);
});
onMounted(() => {
  const updateJsonFormDebounced = _.debounce(() => {
    window.setTimeout(updateJsonForm, 100);
  },100,{leading:false, trailing:true})

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

