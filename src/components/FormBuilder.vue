<template>

  <div class="">

    <Modal
        :tool="toolEdit"
        :schemaReadOnly="schemaReadOnly"

        @change="onChange"
        @close="isModalOpen=false;toolEdit=null"

        v-if="isModalOpen && toolEdit"
    />

    <FormBuilderBar
        :jsonForms="schemaReadOnly ? props.jsonForms : {}"
        :schemaReadOnly="!!schemaReadOnly"
        @drag="e=>drag = !!e"
    />

    <component :is="getComponent(baseTool.componentName)"
               :tool="baseTool"
               :isRoot="true"
               :isDragging="!!drag"
              class="my-4"
              ref="rootForm"
    />

  </div>

</template>

<style scoped>

</style>


<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import {
  FormBuilderBar,
  createJsonForms, findLayoutTool, getComponent,
  emitter, denormalizeModalOptions,
} from "../index";
import Modal from "./Modal.vue";

const props = defineProps({
  jsonForms: Object,
  schemaReadOnly: Boolean,
})

const emit = defineEmits(['schemaUpdated']);

const rootForm = ref(null);
const drag = ref(false);
const jsonFormsUiSchema = ref({});
const jsonFormsSchema = ref({});
const isModalOpen = ref(false);
const toolEdit = ref(null);

const baseTool = computed(() => {
  return findLayoutTool(
      props?.jsonForms?.schema ?? {},
      (props.jsonForms?.uischema?.type && props.jsonForms.uischema) ?? {type:'VerticalLayout'}
  );
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
  const jsonForms = createJsonForms(rootForm, props.schemaReadOnly ? props.jsonForms?.schema : undefined);
  jsonFormsSchema.value = jsonForms.schema;
  jsonFormsUiSchema.value = jsonForms.uischema;

  emit('schemaUpdated', jsonForms)
  emitter.emit('formBuilderSchemaUpdated', jsonForms)
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
  emitter.off('formBuilderModal');
  emitter.off('formBuilderUpdated');
})

</script>

