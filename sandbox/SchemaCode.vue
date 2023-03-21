<template>

  <div class="relative">

    <section class="schemaCode">

      <div class="w-full">
        <h4>Schema</h4>
        <textarea class="code" @change="e => emit('update:schema', parseJSON(e.target.value))">{{ schemaStringRef }}</textarea>
      </div>

      <div class="w-full">
        <h4>UI Schema</h4>
        <textarea class="code" @change="e => emit('update:uischema', parseJSON(e.target.value))">{{ uischemaStringRef }}</textarea>
      </div>


    </section>

    <template v-if="isSupported">
      <button :class="['copy',{copied:copied}]" @click='copy(formString)' />
    </template>

  </div>

</template>


<style>
:root {
  --vp-icon-copy: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' height='20' width='20' stroke='rgba(128,128,128,1)' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2'/%3E%3C/svg%3E");
  --vp-icon-copied: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' height='20' width='20' stroke='rgba(128,128,128,1)' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4'/%3E%3C/svg%3E");
}
</style>

<style scoped>
section {
  @apply
  flex
}

section > div {
  @apply w-full p-4
}

section h4 {
  @apply block
}

textarea {
  @apply w-full aspect-[8/9]
  font-mono text-xs
  text-yellow-100
  bg-gray-900
  rounded
  border-0
  outline-none  appearance-none resize-none
}

button.copy {
  background-image: var(--vp-icon-copy);
  background-position: 50%;
  background-size: 16px;
  background-repeat: no-repeat;

  @apply
  absolute w-8 h-8 -top-2 -right-2

  rounded-full

  hover:bg-black hover:text-white

  transition-colors
  duration-300
}
button.copy.copied {
  background-image: var(--vp-icon-copied);
}
</style>

<script setup>
import { ref, computed } from 'vue'
import {useClipboard} from "@vueuse/core";

const props = defineProps({schema:Object,uischema:Object});
const emit = defineEmits(['update:schema', 'update:uischema'])

const schema = ref(props.schema)
const uischema = ref(props.uischema)

const schemaString = computed(() => JSON.stringify(props.schema, null, 2));
const uischemaString = computed(() => JSON.stringify(props.uischema, null, 2));
const formString = computed(() => JSON.stringify({...props,data:{}}, null, 2));
const schemaStringRef = ref(schemaString);
const uischemaStringRef = ref(uischemaString);

const { text, copy, copied, isSupported } = useClipboard({ formString })

const parseJSON = (e) => {
  try {
    const a = JSON.parse(e);

    if(!a) {
      throw "schema validation error";
    }

    return a;
  }
  catch (e) {
    alert(e);
  }
}
</script>
