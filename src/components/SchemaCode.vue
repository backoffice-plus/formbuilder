<template>

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

</template>


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
</style>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({schema:Object,uischema:Object});
const emit = defineEmits(['update:schema', 'update:uischema'])

const schema = ref(props.schema)
const uischema = ref(props.uischema)

const schemaString = computed(() => JSON.stringify(props.schema, null, 2));
const uischemaString = computed(() => JSON.stringify(props.uischema, null, 2));
const schemaStringRef = ref(schemaString);
const uischemaStringRef = ref(uischemaString);

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
