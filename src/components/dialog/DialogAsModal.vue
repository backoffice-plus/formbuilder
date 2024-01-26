<template>

  <dialog ref="dialog" @close="onClose">
    <header data-dialog-draggable />

    <button type="button" class="close" @click="clickClose" v-if="!options?.hideClose">
      <Icon icon="mdi:close"/>
    </button>

    <render/>

  </dialog>

</template>


<style scoped>
dialog {
  z-index: 30;
  background-color: var(--modal);
  border-color: var(--modal-border);

  @apply
  rounded-md shadow-lg
  border
}

dialog[open] {
  opacity: 1;
  animation: fadeIn 150ms ease normal;
  transform-origin: top;
}

dialog > header {
  @apply
  absolute left-0 top-0 right-8
  h-4
  cursor-move
  select-none
}

dialog > button.close {
  color: var(--toolItem-icon);
  @apply
  absolute
  right-1 top-1.5

  w-6 h-6 aspect-square

  rounded-full

  flex items-center justify-center
}

dialog > button.close:hover {
  background-color: var(--buttonRounded-hover);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    scale: 0.8
  }
  to {
    opacity: 1;
    scale: 1
  }
}

</style>


<script setup lang="ts">
import {ref, h, type Ref, onMounted} from "vue";
import {Icon} from "@iconify/vue";
import {getFormbuilder} from "@/";
import type {DynamicComponent, ModalControl, ModalOptions} from "@/";
import { makeDialogDraggable } from 'dialog-draggable';

makeDialogDraggable();

const props = defineProps<{
  component: DynamicComponent,
  options?: ModalOptions,
  modalControl?: ModalControl,
}>();

const dialog = ref() as Ref<HTMLDialogElement>;
const fb = getFormbuilder();

const render = () => {
  if (props.component?.slots) {
    return h(props.component.is, props.component.bind, props.component.slots)
  } else {
    return h(props.component.is, props.component.bind)
  }
}

const clickClose = (event: Event) => {
  event.preventDefault();
  dialog.value?.close();
}

const onClose = (event: Event) => {
  fb?.exposed?.dialogRegistry.removeDialog(dialog.value.id)
  props.options?.onClose?.(dialog.value.returnValue);
}

onMounted(() => {
  dialog.value?.showModal();
})


</script>
