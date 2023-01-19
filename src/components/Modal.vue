<template>

  <div v-if="open" class="modal">
    <div class="modalBg">
      <div class="centerItem">
        <div class="panel">
          <ModalContent :tool="tool" :schemaReadOnly="schemaReadOnly" @change="data=>emit('change', data)" ref="modal"/>
        </div>
      </div>
    </div>
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
import ModalContent from "./ModalContent.vue";
import {onClickOutside, onKeyStroke} from "@vueuse/core";
import {ref} from "vue";

const props = defineProps({
  tool: Object,
  schemaReadOnly: Boolean,
  open: Boolean,
})

const emit = defineEmits(['close', 'change']);

const modal = ref(null)
onClickOutside(modal, (event) => {
  emit('close')
})
onKeyStroke('Escape', (e) => {
  e.preventDefault()
  emit('close')
})

</script>

