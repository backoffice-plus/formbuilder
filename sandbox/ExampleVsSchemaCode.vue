<template>

  <section class="schemaCode">

    <div class="w-full grow">
      <h4>Example Schema</h4>
      <textarea class="code">{{ props.example }}</textarea>
    </div>

    <div class="w-full grow">
      <h4>
        Rendered Schema
        <small v-if="diffs.length>1" class="text-red-500">Render mismatch</small>
        <small v-else-if="diffs.length==1" class="text-green-500">Render match</small>
      </h4>
<!--      <textarea class="code">{{ props.example }}</textarea>-->
      <pre class="code" v-html="htmlTxt" />
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
  @apply overflow-y-scroll
}
</style>

<script setup>
import {diffChars, } from 'diff';

const props = defineProps({schema:Object,example:Object});

const exampleString = JSON.stringify(props.example, null, 2);
const schemaString = JSON.stringify(props.schema, null, 2);

console.log("props",props);

//console.log("diffChars",exampleString, schemaString);

const diffs = diffChars(exampleString,schemaString);
const htmlTxt = diffs.map(part => {
  const bg = part.added ? 'bg-green-800' : (part.removed ? 'bg-red-700' : null);
  return bg ? `<span class='${bg}'>${part.value}</span>` : part.value;
}).join('');


</script>
