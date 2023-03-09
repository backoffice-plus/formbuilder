<template>

  <div class="formbuilder">


    <Modal
        :tool="toolEdit"
        :jsonFormsRenderers="jsonFormsRenderers"
        :schemaReadOnly="schemaReadOnly"

        @change="onChangeModal"
        @close="isModalOpen=false;toolEdit=null"

        v-if="isModalOpen && toolEdit"
    />

    Mode:
    <select v-model="showBuilder" @change="onChangeMode">
      <option>schema</option>
      <option>uischema</option>
      <option>definitions</option>
    </select>

    <nav>

      <div class="tabs">
        <button @click="showBar='schema';" :class="{active:'schema'===showBar}">Controls</button>
        <button @click="showBar='uischema';" :class="{active:'uischema'===showBar}" v-if="showBuilder==='uischema'">Layout</button>
        <button @click="showBar='properties';" :class="{active:'properties'===showBar}" v-if="schemaReadOnly">Properties</button>
      </div>

<!--      <span v-if="modeSchemaChanged" class="text-red-500">Schema has Changes!</span>-->

      <FormBuilderBar
          :jsonForms="schemaReadOnly ? props.jsonForms : {}"
          :tools="tools"
          :schemaReadOnly="!!schemaReadOnly"
          @drag="e=>drag = !!e"
      />

    </nav>


    <template  v-if="currentBaseTool">
      <component :is="currentBaseTool.importer()"
                 :tool="currentBaseTool"
                 :isRoot="true"
                 :isDragging="!!drag"
                 class="my-4"
                 :key="currentBaseTool.propertyName"
      />
    </template>

<!--    &lt;!&ndash; Schema &ndash;&gt;-->
<!--    <component :is="baseSchemaTool.importer()"-->
<!--               :tool="baseSchemaTool"-->
<!--               :isRoot="true"-->
<!--               :isDragging="!!drag"-->
<!--               class="my-4"-->
<!--               :ref="setRootSchemaForm"-->
<!--               v-if="'schema' === showBuilder"-->
<!--    />-->

<!--    &lt;!&ndash; UISchema &ndash;&gt;-->
<!--    <component :is="baseUiTool.importer()"-->
<!--               :tool="baseUiTool"-->
<!--               :isRoot="true"-->
<!--               :isDragging="!!drag"-->
<!--               class="my-4"-->
<!--               :ref="setRootForm"-->
<!--               v-if="'uischema' === showBuilder && baseUiTool"-->
<!--    />-->


<!--    &lt;!&ndash; Definitions &ndash;&gt;-->
<!--    <component :is="baseDefinitionTool.importer()"-->
<!--               :tool="baseDefinitionTool"-->
<!--               :isRoot="true"-->
<!--               :isDragging="!!drag"-->
<!--               class="my-4"-->
<!--               :ref="setRootDefinitionForm"-->
<!--               v-if="'definitions' === showBuilder"-->
<!--    />-->

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
  emitter, cloneToolWithSchema, createTypeObjectSchema, findAllProperties, findAllScopes,
} from "../index";
import Modal from "./Modal.vue";
import {useTools} from "../composable/tools";
import {useJsonforms} from "../composable/jsonforms";
import {normalizePath, normalizeScope} from "../lib/normalizer";
import _ from "lodash";
import {objectTool} from "../lib/tools/ObjectTool";
import {generateDefaultUISchema} from "@jsonforms/core/src/generators/uischema";
import {generateJsonSchema} from "@jsonforms/core";
import {useToolInstance} from "../composable/toolinstance";

const props = defineProps({
  jsonForms: Object,
  jsonFormsRenderers: Array,
  schemaReadOnly: Boolean,
  tools: Array,
})

const emit = defineEmits(['schemaUpdated']);


const drag = ref(false);
const jsonFormsUiSchema = ref(props?.jsonForms?.uischema);
const jsonFormsSchema = ref(props?.jsonForms?.schema);
const isModalOpen = ref(false);
const toolEdit = ref(null);
const showBuilder = ref('uischema');
const showBar = ref('schema');
const modeSchemaChanged = ref(false);

const {registerTools, unregisterAllTools, findLayoutToolByUiType, findMatchingTool} = useTools();
const {getControlTools, getLayoutTools} = useTools();

const {update, schema: rootSchema, uischema: rootUischema} = useJsonforms();
const {baseTool: baseUiTool2, createBaseTool, createSchemaTool, createDefTool} = useToolInstance();


//update(props.jsonForms?.schema, props.jsonForms?.uischema);


//:TODO there is a lot of renderings - how to optimize?
// onRenderTriggered((e) => {
//   console.log("FB.onRenderTriggered",e);
// });

const onChangeMode = (e) => {
  const mode = e.target.value;
  switch (mode) {
    case 'schema':
      showBar.value='schema';

      baseSchemaTool.value = createSchemaTool(rootSchema.value);
      currentBaseTool.value = baseSchemaTool.value;
      break;

    case 'uischema':
      showBar.value='schema';

      //:TODO add property & scope changed check!

      baseUiTool.value = createBaseTool(rootSchema.value, rootUischema.value).value;
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
      all = getControlTools();
      break;

    case 'uischema':
      all = getLayoutTools();
      break;
  }

  // if(!props.schemaReadOnly) {
  //   all.push(...getControlTools())
  // }
  //
  // if('uischema' === showBuilder.value) {
  //   all.push(...getLayoutTools())
  // }

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

      const clone = cloneToolWithSchema(findMatchingTool(rootSchema, itemSchema, itemUischema),  itemSchema, itemUischema)
      clone.propertyName = name;
      clone.schemaReadOnly = true;

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
      updateSchemaMode();
      break;
    case 'definitions':
      updateDefinitionMode();
      break;

    default:
      updateUischemaMode();
      break;
  }
}

const updateSchemaMode = () => {
  if (baseSchemaTool?.value) {
    const r = createTypeObjectSchema(baseSchemaTool.value);
    update(r.schema, rootUischema.value)
    emit('schemaUpdated', {schema:r.schema, uischema:rootUischema.value})
  }
}


const updateDefinitionMode = () => {
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

const updateUischemaMode = () => {
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
    console.log("updateUischemaMode",jsonFormsSchema.value, jsonFormsUiSchema.value)
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
  unregisterAllTools();   //is that a good behavior?
  registerTools(props.tools);

  const baseToolFromStore = createBaseTool(props?.jsonForms?.schema, props?.jsonForms?.uischema);
  baseUiTool.value = baseToolFromStore.value;
  currentBaseTool.value = baseUiTool.value;

  baseDefinitionTool.value = createDefTool(props?.jsonForms?.schema);

});
onMounted(() => {
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

