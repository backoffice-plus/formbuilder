<template>

  <div class="modal">
    <div class="modalBg">
      <div class="centerItem">
        <div class="panel" ref="modal">
          <ModalContent :tool="tool" :jsonFormsRenderers="jsonFormsRenderers" @change="data=>emit('change', data)"/>
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
  background-color: var(--modal);

  min-height: 50vh;

  @apply
  container max-w-screen-sm

  overflow-hidden

  rounded shadow
}
</style>

<style>
.fixBody {
  @apply h-screen overflow-y-hidden pr-4
}
</style>

<script setup>
import ModalContent from "./ModalContent.vue";
import {onClickOutside, onKeyStroke} from "@vueuse/core";
import {onMounted, onUnmounted, ref, watch} from "vue";

const props = defineProps({
  tool: Object,//ToolInterface,
  jsonFormsRenderers: Array,
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
onMounted(() => {
  document.body.classList.add('fixBody')
})
onUnmounted(() => {
  document.body.classList.remove('fixBody')
})
</script>

