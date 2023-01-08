<template>

  <div class="">

    <Dialog as="div" @close="isModalOpen=false" :open="isModalOpen" class="modal">
      <div class="modalBg">
        <div class="centerItem">
          <DialogPanel class="panel" >
              <OptionModal v-bind="modalData" />
          </DialogPanel>
        </div>
      </div>
    </Dialog>

    <FormBuilderBar @drag="e=>drag = !!e"/>

    <FlexArea
        class="my-4"
        uuid="root"
        ref="rootForm"

        :toolProps="tool.props"
        :isDragging="!!drag"
    />

    <details>
      <summary class="cursor-pointer">JSON</summary>
      <div class="card p-4">
        <SchemaCode
            v-model:schema="jsonFormsSchema"
            v-model:uischema="jsonFormsUiSchema"
            @update:schema="updateEditor()"
            @update:uischema="updateEditor()"
        />
      </div>
    </details>

    <details>
      <summary class="cursor-pointer">Preview</summary>
      <ResizeArea>
        <div class="card p-4" style="min-height: 106px">
            <JsonForms
                :class="'styleA'"
                :schema="jsonFormsSchema"
                :uischema="jsonFormsUiSchema"
                :data="{}"
                :renderers="jsonFormRenderes"
                v-if="jsonFormsSchema && jsonFormsUiSchema"
            />
        </div>
      </ResizeArea>
    </details>

  </div>

</template>

<style>
details {
  @apply mb-2
}
details summary {
   @apply
   text-sky-800
    hover:text-opacity-70
 }
</style>


<script setup>
import { ref } from 'vue'
import { onMounted, onBeforeUnmount } from 'vue'
import {JsonForms} from "@jsonforms/vue";
import {Dialog ,  DialogPanel,  DialogTitle, DialogDescription} from '@headlessui/vue';
import {
  FormBuilderBar, ResizeArea, FlexArea, SchemaCode, OptionModal, jsonFormRenderes,
  createJsonForms, findLayoutTool
} from "../index";
import mitt from "mitt";

const props = defineProps({
  data: Object
})

const emit = defineEmits(['schemaUpdated']);

const tool = findLayoutTool(props?.data?.schema ?? {}, props?.data?.uischema ?? {type:'VerticalLayout'});
if(!tool) {
  throw "no tool was found";
}

const rootForm = ref(null);
const drag = ref(false);
const jsonFormsUiSchema = ref({});
const jsonFormsSchema = ref({});

const updateJsonForm = () => {
  const jsonForms = createJsonForms(rootForm);
  jsonFormsSchema.value = jsonForms.schema;
  jsonFormsUiSchema.value = jsonForms.uischema;
  emit('schemaUpdated', jsonForms)
}

const updateEditor = () => {
  tool.props.jsonForms.schema = jsonFormsSchema.value;
  tool.props.jsonForms.uischema = jsonFormsUiSchema.value;
  rootForm.value.init();
}

const isModalOpen = ref(false);
let modalData = {};


onMounted(() => {
  mitt().on('formBuilderModal', (data) => {
    isModalOpen.value = true;
    modalData = data; //uuid:, data:, type:
  })
  mitt().on('formBuilderUpdated', (data) => {
    window.setTimeout(updateJsonForm,100);
  });
});
onBeforeUnmount(() => {
  mitt().off('formBuilderModal');
  mitt().off('formBuilderUpdated');
})

</script>

