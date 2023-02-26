<template>

  <section class="card p-4">

    <div class="w-1/2">
      <div class="flex justify-between">
        <h4>Schema
          <small v-if="diffsSchema.length>1" class="text-red-500">Render mismatch</small>
          <small v-else-if="diffsSchema.length==1" class="text-green-500">Render match</small>
        </h4>
        <div>
          <button @click="showDiffSchema=1">[diff]</button>
          <button @click="showDiffSchema=2">[example]</button>
          <button @click="showDiffSchema=3">[rendered]</button>
        </div>
      </div>
      <pre class="code" v-html="htmlTxtSchema" v-if="showDiffSchema===1"/>
      <textarea class="code" v-else-if="showDiffSchema===2">{{ exampleSchemaString }}</textarea>
      <textarea class="code" v-else-if="showDiffSchema===3">{{ schemaString }}</textarea>
    </div>

    <div class="w-1/2">
      <div class="flex justify-between">
        <h4>
          UI Schema
          <small v-if="diffsUischema.length>1" class="text-red-500">Render mismatch</small>
          <small v-else-if="diffsUischema.length==1" class="text-green-500">Render match</small>
        </h4>
        <div>
          <button @click="showDiffUischema=1">[diff]</button>
          <button @click="showDiffUischema=2">[example]</button>
          <button @click="showDiffUischema=3">[rendered]</button>
        </div>
      </div>
      <pre class="code" v-html="htmlTxtUischema" v-if="showDiffUischema===1"/>
      <textarea class="code" v-else-if="showDiffUischema===2">{{ exampleUischemaString }}</textarea>
      <textarea class="code" v-else-if="showDiffUischema===3">{{ uischemaString }}</textarea>
    </div>

  </section>

</template>


<style scoped>
section {
  @apply
  flex
}

section > div {
  @apply p-4
}

section h4 {
  @apply block
}

textarea, pre.code {
  @apply w-full aspect-[8/9]
  font-mono text-xs
  text-yellow-100
  bg-gray-900
  rounded
  border-0
  outline-none  appearance-none resize-none
}
pre.code {
  @apply overflow-scroll
}
</style>

<script setup>
import {diffChars, } from 'diff';
import {ref} from "vue";

const props = defineProps({jsonforms:Object,example:Object});

const exampleSchemaString = JSON.stringify(props.example.schema, null, 2);
const schemaString = JSON.stringify(props.jsonforms.schema, null, 2);

const exampleUischemaString = JSON.stringify(props.example.uischema, null, 2);
const uischemaString = JSON.stringify(props.jsonforms.uischema, null, 2);

const showDiffSchema=ref(1);
const showDiffUischema=ref(1);

const createhtml = (part) => {
  const bg = part.added ? 'bg-green-800' : (part.removed ? 'bg-red-700' : null);
  return bg ? `<span class='${bg}'>${part.value}</span>` : part.value;
}

const diffsSchema = diffChars(exampleSchemaString,schemaString);
const htmlTxtSchema = diffsSchema.map(part => createhtml(part)).join('');

const diffsUischema = diffChars(exampleUischemaString,uischemaString);
const htmlTxtUischema = diffsUischema.map(part => createhtml(part)).join('');

</script>
