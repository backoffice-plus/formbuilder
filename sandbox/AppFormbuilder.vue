<template>

  <div class="container max-w-screen-lg mx-auto p-4 flex flex-col gap-4">

    <div class="styleA">
      Select Example:
      <select v-model="example" style="width:auto;display:inline" >
        <option></option>
        <option v-for="e in examples" :value="e.name">{{e.label}}</option>
      </select>
      <a :href="'#/jsonforms?example=' + example" v-if="example" class="ml-1 text-sm">[open Jsonforms]</a><br>

      <div v-if="example">Schema ReadOnly: <input type="checkbox" v-model="schemaReadOnly" /></div>
    </div>

      <FormBuilder
          :jsonForms="jsonForms"
          :jsonFormsRenderers="jsonFormsRenderers"
          :schemaReadOnly="schemaReadOnly"
          :tools="tools"
          :key="example + (schemaReadOnly?1:0)"
          @schemaUpdated="onSchemaUpdated"
      />
    <!--            -->

    <FormBuilderDetails :jsonForms="jsonFormsResolved" />

    <details v-if="example && !schemaReadOnly">
      <summary class="cursor-pointer">JSON Render Diff</summary>
      <ExampleVsSchemaCode
          :example="latestExampleData"
          :jsonforms="latestSchemaAfterExampleData"
          :key="example + (schemaReadOnly?'readonly':'')"
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

import {defaultTools, emitter, FormBuilder} from "../src/index.ts";
import FormBuilderDetails from "./FormBuilderDetails.vue";
import {computed, onMounted, ref, unref, watch} from "vue";
import * as ownExamples from "./jsonForms/examples";
import {schema as vuetifySchema, uischema as vuetifyUischema} from "./jsonForms/vuetifyOptions";
import {getExamples} from '@jsonforms/examples/src'
import {generateDefaultUISchema, generateJsonSchema} from "@jsonforms/core";
import {resolveSchema} from "../src";
import {getExampleFromUrl, getUrl} from "./lib";
import {vanillaRenderers} from "@jsonforms/vue-vanilla";
import {boplusVueVanillaRenderers} from "../src/index";
import SchemaCode from "./SchemaCode.vue";
import ExampleVsSchemaCode from "./ExampleVsSchemaCode.vue";
import _ from "lodash";
import type {EventAfterOptionJsonforms} from "../src/lib/mitt";
import {formbuilderRenderers} from "../src/components/renderers";

const tools = [
    ...defaultTools,
]

const jsonFormsRenderers = Object.freeze([
  ...vanillaRenderers,
  ...boplusVueVanillaRenderers,
  ...formbuilderRenderers,
]);

const oe = ownExamples;//import own examples

const url = computed(() => getUrl());
const examples = computed(() => getExamples().sort((a,b)=>a.label.toLowerCase()>b.label.toLowerCase()?1:-1));
const example = ref(getExampleFromUrl());
const schemaReadOnly = ref(false);
const jsonFormsResolved = ref({});
const latestExampleData = ref({});
const latestSchemaAfterExampleData = ref(null);

const rootSchema = ref();
const rootUiSchema = ref();
const onSchemaUpdated = (jsonForms) => {
  rootSchema.value = jsonForms.schema;
  rootUiSchema.value = jsonForms.uischema;
  jsonFormsResolved.value = unref(jsonForms);
}

const jsonForms = computed(() => {
  let exampleData = {schema:undefined, uischema:undefined} as any;

  if(example.value) {
    exampleData = getExamples().find(item => item.name===example.value) as any;

    if(exampleData) {
      if (!exampleData?.schema) {
        exampleData.schema = generateJsonSchema({});
      }

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

  if(schemaReadOnly.value) {
    delete exampleData.uischema;
  }

  latestExampleData.value = unref(exampleData);
  latestSchemaAfterExampleData.value = null;

  return exampleData
});

const updateJsonFormDebounced = _.debounce((a) => {
  latestSchemaAfterExampleData.value = {schema:rootSchema.value,uischema:rootUiSchema.value};
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


// emitter.on('afterOptionJsonforms', (event: EventAfterOptionJsonforms) => {
//   const tool = event.tool;
//
//   if('Control' === tool.uischema?.type) {
//     _.merge(event.schema, vuetifySchema);  //merge into schema
//     event.uischema.elements.push(vuetifyUischema); //attach tab
//   }
// })

</script>
