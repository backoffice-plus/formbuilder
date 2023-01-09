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
        ref="rootForm"

        :tool="tool"
        :isRoot="true"
        :isDragging="!!drag"
    />

  </div>

</template>

<style scoped>
.modal {
  @apply
  relative z-10
}
.modal > .modalBg {
  @apply
  fixed inset-0 overflow-y-auto
  bg-black/30
}
.modal > .modalBg > .centerItem {
  @apply
  flex items-center justify-center
  min-h-full
}
.modal > .modalBg > .centerItem .panel {
  @apply
  w-full max-w-md

  overflow-hidden

  bg-white rounded shadow
}
</style>


<script setup>
import { ref } from 'vue'
import { onMounted, onBeforeUnmount } from 'vue'
import {JsonForms} from "@jsonforms/vue";
import {Dialog ,  DialogPanel,  DialogTitle, DialogDescription} from '@headlessui/vue';
import {
  FormBuilderBar, ResizeArea, FlexArea, SchemaCode, OptionModal, jsonFormRenderes,
  createJsonForms, findLayoutTool,
  emitter
} from "../index";

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
  emitter.emit('formBuilderSchemaUpdated', jsonForms)
}

const isModalOpen = ref(false);
let modalData = {};


onMounted(() => {
  emitter.on('formBuilderModal', (data) => {
    isModalOpen.value = true;
    modalData = data; //uuid:, data:, type:
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

