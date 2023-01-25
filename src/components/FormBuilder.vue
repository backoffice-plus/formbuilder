<template>

  <div class="">

    <Modal
        :tool="toolEdit"
        :schemaReadOnly="schemaReadOnly"

        @change="onChange"
        @close="isModalOpen=false;toolEdit=null"

        v-if="isModalOpen && toolEdit"
    />

    <div class="flex gap-2">
     <button @click="showBuilder='uischema'" class="hover:bg-gray-200">UI Schema</button>
     <button @click="showBuilder='definitions'" class="hover:bg-gray-200">Definitions</button>
    </div>

    <!-- UISchema -->
    <template v-if="'uischema' === showBuilder">
        <FormBuilderBar
            :jsonForms="schemaReadOnly ? props.jsonForms : {}"
            :schemaReadOnly="!!schemaReadOnly"
            @drag="e=>drag = !!e"
        />

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
      <FormBuilderDefinitions :definitions="jsonFormsSchema.definitions"/>
    </template>

  </div>

</template>

<style scoped>

</style>


<script setup>
import {computed, ref, onMounted, onBeforeUnmount} from 'vue'
import {
  FormBuilderBar,
  createJsonForms, defaultTools,
  emitter,
} from "../index";
import {denormalizeModalOptions} from '../lib/normalizer'
import Modal from "./Modal.vue";
import {Generate} from "@jsonforms/core/src/generators/Generate";
import FormBuilderDefinitions from "./FormBuilderDefinitions.vue";
import {useTools} from "../composable/tools";
import {unknownTool} from "../lib/tools/unknownTool";
import {useJsonforms} from "../composable/jsonforms";

const props = defineProps({
  jsonForms: Object,
  schemaReadOnly: Boolean,
})

const emit = defineEmits(['schemaUpdated']);

const rootForm = ref(null);
const drag = ref(false);
const jsonFormsUiSchema = ref(props?.jsonForms?.uischema ?? {});
const jsonFormsSchema = ref(props?.jsonForms?.schema ?? Generate.jsonSchema({}));
const isModalOpen = ref(false);
const toolEdit = ref(null);
const showBuilder = ref('uischema');

const {registerTools, unregisterAllTools, findLayoutToolByUiType} = useTools();
registerTools(defaultTools);

const baseTool = computed(() => {
  const uiSchema = (jsonFormsUiSchema.value?.type && jsonFormsUiSchema.value) ?? {type:'VerticalLayout'};
  let tool = findLayoutToolByUiType(uiSchema.type) ?? unknownTool;
  return tool.clone(jsonFormsSchema.value, uiSchema)
})

const onChange = (data) => {
  if(toolEdit.value) {
    if(data.propertyName) {
      toolEdit.value.props.propertyName = data.propertyName;
    }
    toolEdit.value.props.jsonForms.update(denormalizeModalOptions(data));
    updateJsonForm();
  }
}

const updateJsonForm = () => {
  if(!rootForm?.value) {
    return;
  }

  const newJsonForms = createJsonForms(rootForm, jsonFormsSchema.value, props.schemaReadOnly);
  jsonFormsSchema.value = newJsonForms.schema;
  jsonFormsUiSchema.value = newJsonForms.uischema;

  const {update} = useJsonforms();
  update(newJsonForms.schema, newJsonForms.uischema)

  emit('schemaUpdated', newJsonForms)
  //emitter.emit('formBuilderSchemaUpdated', newJsonForms)
}

const setRootForm = (e) => {
  rootForm.value = e;
}

onMounted(() => {
  window.setTimeout(() => emitter.emit('formBuilderUpdated'),50);

  emitter.on('formBuilderModal', (data) => {
    isModalOpen.value = true;
    toolEdit.value = data.tool;
  })
  emitter.on('formBuilderUpdated', (data) => {
    window.setTimeout(updateJsonForm,100);
  });
});
onBeforeUnmount(() => {
  unregisterAllTools();

  emitter.off('formBuilderModal');
  emitter.off('formBuilderUpdated');
})

</script>

