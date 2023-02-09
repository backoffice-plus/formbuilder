<template>

  <div class="">


    <Modal
        :tool="toolEdit"
        :schemaReadOnly="schemaReadOnly"

        @change="onChange"
        @close="isModalOpen=false;toolEdit=null"

        v-if="isModalOpen && toolEdit"
    />

    <div class="tabs">
      <button @click="showBuilder='uischema'" :class="{active:showBuilder==='uischema'}">UI Schema</button>
      <button @click="showBuilder='definitions'" :class="{active:showBuilder==='definitions'}">Definitions</button>
    </div>

    <FormBuilderBar
        :jsonForms="schemaReadOnly ? props.jsonForms : {}"
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
import {computed, ref, unref, onMounted, onBeforeUnmount, watch} from 'vue'
import {
  FormBuilderBar,
  createJsonForms,
  emitter, cloneToolWithSchema, createTypeObjectSchema,
} from "../index";
import Modal from "./Modal.vue";
import {Generate} from "@jsonforms/core/src/generators/Generate";
import {useTools} from "../composable/tools";
import {unknownTool} from "../lib/tools/unknownTool";
import {useJsonforms} from "../composable/jsonforms";
import {normalizeScope} from "../lib/normalizer";
import _ from "lodash";
import {objectTool} from "../lib/tools/ObjectTool";

const props = defineProps({
  jsonForms: Object,
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

const {registerTools, unregisterAllTools, findLayoutToolByUiType, findMatchingTool} = useTools();

const {update} = useJsonforms();
//update(props.jsonForms?.schema, props.jsonForms?.uischema);

const baseTool = computed(() => {
  const schema = unref(jsonFormsSchema);
  const uischema = unref(jsonFormsUiSchema);
  const uiSchemaType = (uischema?.type && uischema.type) ?? 'VerticalLayout';

  //specialcase - some examples use none-Layout-elements as root
  if ('Control' === uischema?.type) {
    let itemSchema;
    //not working well!!!
    if ('#' === uischema.scope) {
      const propKeys = Object.keys(schema.properties);
      itemSchema = propKeys[0] && schema.properties[propKeys[0]]
    } else {
      itemSchema = _.get(schema, normalizeScope(uischema.scope));
    }
    const tool = findMatchingTool(schema, itemSchema, uischema) ?? unknownTool;
    return cloneToolWithSchema(tool, itemSchema, uischema);
  }

  const tool = findLayoutToolByUiType(uiSchemaType) ?? unknownTool;
  return cloneToolWithSchema(tool, schema, uischema);
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

onMounted(() => {
  unregisterAllTools();   //is that a good behavior?
  registerTools(props.tools);

  window.setTimeout(() => emitter.emit('formBuilderUpdated'), 50);

  emitter.on('formBuilderModal', (data) => {
    isModalOpen.value = true;
    toolEdit.value = data.tool;
  })
  emitter.on('formBuilderUpdated', (data) => {
    window.setTimeout(updateJsonForm, 100);
  });
});
onBeforeUnmount(() => {
  emitter.off('formBuilderModal');
  emitter.off('formBuilderUpdated');
})

</script>

