<template>

  <div class="container max-w-screen-lg mx-auto p-4 flex flex-col gap-4">

    <div>
      Disable Formbuilder: <input type="checkbox" v-model="disableFormbuilder" /><br>
      Schema ReadOnly: <input type="checkbox" v-model="schemaReadOnly" /><br>
      Select Example:
      <select v-model="example" class="inline" >
        <option></option>
        <option v-for="e in examples" :value="e.name">{{e.label}}</option>
      </select>
      <a :href="'#/jsonforms?example=' + example" v-if="example" class="ml-1 text-sm">[open Jsonforms]</a>
    </div>

      <FormBuilder
          :jsonForms="jsonForms"
          :jsonFormsRenderers="jsonFormsRenderers"
          :schemaReadOnly="schemaReadOnly"
          :tools="tools"
          v-if="!disableFormbuilder"
          :key="example + (schemaReadOnly?1:0)"
      />
    <!--            -->

    <FormBuilderDetails :jsonForms="jsonFormsResolved" :key="(disableFormbuilder?1:0)" />

    <details v-if="example">
      <summary class="cursor-pointer">JSON Render Diff</summary>
      <ExampleVsSchemaCode
          :example="latestExampleData"
          :jsonforms="latestSchemaAfterExampleData"
          :key="example + (schemaReadOnly?1:0)"
          v-if="latestSchemaAfterExampleData?.schema"
      />
    </details>

  </div>

</template>

<style>
.formbuilder nav {
 box-shadow: 0px 8px 8px -8px rgb(30, 30, 30, 30%);
  z-index:9;
 @apply
 sticky top-0 pt-2
}

</style>

<script setup lang="ts">

import {defaultTools, FormBuilder, useJsonforms} from "../src/index.ts";
import FormBuilderDetails from "./FormBuilderDetails.vue";
import {computed, onMounted, ref, unref, watch} from "vue";
import * as ownExamples from "./jsonForms/examples";
import {getExamples} from '@jsonforms/examples/src'
import {generateDefaultUISchema, generateJsonSchema} from "@jsonforms/core";
import {resolveSchema} from "../src";
import {getExampleFromUrl, getUrl} from "./lib";
import {vanillaRenderers} from "@jsonforms/vue-vanilla";
import {boplusVueVanillaRenderers} from "../src/index";
import SchemaCode from "./SchemaCode.vue";
import ExampleVsSchemaCode from "./ExampleVsSchemaCode.vue";
import _ from "lodash";

const tools = [
    ...defaultTools,
]

const jsonFormsRenderers = Object.freeze([
  ...vanillaRenderers,
  ...boplusVueVanillaRenderers,
]);

const oe = ownExamples;//import own examples

const url = computed(() => getUrl());
const examples = computed(() => getExamples().sort((a,b)=>a.label.toLowerCase()>b.label.toLowerCase()?1:-1));
const example = ref(getExampleFromUrl());
const schemaReadOnly = ref(false);
const disableFormbuilder = ref(false);
const jsonFormsResolved = ref({});
const latestExampleData = ref({});
const latestSchemaAfterExampleData = ref(null);

const {schema: rootSchema, uischema:rootUiSchema} = useJsonforms();

const jsonForms = computed(() => {
  let exampleData = {schema:undefined, uischema:undefined} as any;

  if(example.value) {
    exampleData = getExamples().find(item => item.name===example.value) as any;

    if(exampleData) {
      if(exampleData?.uischema && schemaReadOnly.value) {
        exampleData.uischema = {};
      }
      if(!exampleData?.uischema && !schemaReadOnly.value) {
        console.log("sandbox app","UiSschema generated because example is empty");
        exampleData.uischema = generateDefaultUISchema(exampleData.schema)
      }
    }
  }
  else {
    const schema = generateJsonSchema({});
    const uischema = generateDefaultUISchema(schema);
    delete schema.additionalProperties;

    exampleData = {schema: schema, uischema: uischema};
  }

  latestExampleData.value = unref(exampleData);
  latestSchemaAfterExampleData.value = null;

  return exampleData
});

const updateJsonFormDebounced = _.debounce((a) => {
  latestSchemaAfterExampleData.value = {schema:rootSchema,uischema:rootUiSchema};
},300,{leading:false, trailing:true})


watch(() => jsonForms.value, async () => {
  jsonFormsResolved.value = unref(jsonForms.value);
  //jsonFormsResolved.value.schema = await resolveSchema(jsonFormsResolved.value.schema);
})
watch(() => rootSchema.value, async (a,b) => {
  updateJsonFormDebounced(a);
});
watch(() => example.value, async () => {
  window.location.hash = example.value ? "/?example="+example.value : '';
})
</script>
