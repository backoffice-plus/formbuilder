<template>

  <div class="container max-w-screen-lg mx-auto p-4 flex flex-col gap-4">

    <div>
      Disable Formbuilder: <input type="checkbox" v-model="disableFormbuilder" /><br>
      Schema ReadOnly: <input type="checkbox" v-model="schemaReadOnly" /><br>
      Select Example:
      <select v-model="example" class="inline" >
        <option></option>
        <option v-for="name in examples">{{name.label}}</option>
      </select>
    </div>

      <FormBuilder
          :jsonForms="jsonForms"
          :schemaReadOnly="schemaReadOnly"
          :key="example + (schemaReadOnly?1:0)"
          v-if="!disableFormbuilder"
      />

      <FormBuilderDetails  :jsonForms="jsonForms" :key="(disableFormbuilder?1:0)" />

  </div>

</template>

<script setup lang="ts">

import {FormBuilder} from "../src/index.ts";
import FormBuilderDetails from "./FormBuilderDetails.vue";
import {computed, ref} from "vue";
import * as ownExamples from "./jsonForms/examples";
import {getExamples} from '@jsonforms/examples/src'
import {generateDefaultUISchema} from "@jsonforms/core";

const oe = ownExamples;//import own examples

const examples = computed(() => getExamples().sort((a,b)=>a.label.toLowerCase()>b.label.toLowerCase()?1:-1));
const example = ref('');
const schemaReadOnly = ref(false);
const disableFormbuilder = ref(false);

const jsonForms = computed(() => {
  const exampleData = getExamples().find(item => item.label===example.value);

  if(exampleData) {
    if(exampleData?.uischema && schemaReadOnly.value) {
      exampleData.uischema = {};
    }
    if(!exampleData?.uischema && !schemaReadOnly.value) {
      console.log("sandbox app","UiSschema generated because example is empty");
      exampleData.uischema = generateDefaultUISchema(exampleData.schema)
    }
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
