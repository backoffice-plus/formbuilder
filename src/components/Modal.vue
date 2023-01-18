<template>

  <Dialog as="div" @close="emit('close')" :open="isModalOpen" class="modal">
    <div class="modalBg">
      <div class="centerItem">
        <DialogPanel class="panel">
          <ModalContent :tool="tool" :schemaReadOnly="schemaReadOnly" @change="data=>emit('change', data)"/>
        </DialogPanel>
      </div>
    </div>
  </Dialog>

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
import {Dialog, DialogPanel} from '@headlessui/vue';
import ModalContent from "./ModalContent.vue";

const props = defineProps({
  tool: Object,
  schemaReadOnly: Boolean,
  isModalOpen: Boolean,
})

const emit = defineEmits(['close', 'change']);

</script>

