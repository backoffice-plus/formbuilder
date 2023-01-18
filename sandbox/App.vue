<template>

  <div class="container max-w-screen-lg mx-auto p-4 flex flex-col gap-4">

    <div>
      Schema ReadOnly: <input type="checkbox" v-model="schemaReadOnly" /><br>
      Select Example:
      <select v-model="example" class="inline" >
        <option></option>
        <option v-for="name in examples">{{name}}</option>
      </select>
    </div>

      <FormBuilder
          :jsonForms="jsonForms"
          :schemaReadOnly="schemaReadOnly"
          :key="example + (schemaReadOnly?1:0)"
      />

      <FormBuilderDetails  :jsonForms="jsonForms" />

  </div>

</template>

<script setup lang="ts">

import {FormBuilder} from "../src/index.ts";
import FormBuilderDetails from "./FormBuilderDetails.vue";
import exampleForms from "./jsonForms";
import {computed, ref} from "vue";

const examples = Object.keys(exampleForms);
const example = ref('');
const schemaReadOnly = ref(false);

const jsonForms = computed(() => {
  const exampleData = {...exampleForms[example.value]};

  if(exampleData?.uischema && schemaReadOnly.value) {
    exampleData.uischema = {};
  }

  return exampleData
});

</script>


<style>
body {
  background-color: #f3f4f5;
}

.card {
  @apply
  bg-white rounded shadow
}
</style>
