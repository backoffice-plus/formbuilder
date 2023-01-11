<template>

  <div class="container max-w-screen-lg mx-auto p-4 flex flex-col gap-4">

    <div class="w-1/4">
      Select Example<br>
      <select v-model="example" >
        <option></option>
        <option v-for="name in examples">{{name}}</option>
      </select>
    </div>

      <FormBuilder
          :data="data"
          :key="example"
      />

      <FormBuilderDetails />

  </div>

</template>

<script setup lang="ts">

import {FormBuilder, FormBuilderDetails} from "../src/index.ts";
import exampleForms from "./jsonForms";
import {computed, ref} from "vue";

const examples = Object.keys(exampleForms);
const example = ref('basic');
const data = computed(() => {
  //console.log("data",example.value, exampleForms[example.value]);
  return exampleForms[example.value]
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
