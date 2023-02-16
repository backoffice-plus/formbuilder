<template>

  <div class="container max-w-screen-lg mx-auto p-4 flex flex-col gap-4">

    <div class="flex items-baseline gap-2"><h2>{{ example }}</h2></div>

    <div>
      Select Example:
      <select v-model="example" class="inline" >
        <option></option>
        <option v-for="e in examples" :value="e.name">{{e.label}}</option>
      </select>
      <a :href="'#/?example='+ example" class=" text-sm">[back]</a>
    </div>

    <details open="true">
      <summary class="cursor-pointer">JsonForms</summary>
      <div class="card p-4 styleA">
        <JsonForms
            :schema="jsonForms.schema"
            :uischema="jsonForms.uischema"
            :data="jsonFormsData"
            :renderers="jsonFormRenderesMore"
            :ajv="ajv"
            @change="r => jsonFormsUpdated=r"
        />
      </div>
    </details>

    Data
    <textarea class="w-full h-60 p-4 bg-white rounded" readonly disabled>{{ jsonFormsUpdated?.data }}</textarea>

    <details open="true">
      <summary class="cursor-pointer">JSON</summary>
      <div class="card p-4">
        <SchemaCode
            v-model:schema="jsonForms.schema"
            v-model:uischema="jsonForms.uischema"
        />
      </div>
    </details>

  </div>

</template>

<style>

</style>


<script setup>
import {computed, ref, watch} from 'vue'
import {JsonForms} from "@jsonforms/vue";
import {createAjv, generateDefaultUISchema} from "@jsonforms/core";
import SchemaCode from './SchemaCode.vue'
import {useJsonforms} from "../src";
import {entry as htmlRenderer} from "./tool/htmlRenderer.vue";
import {getExamples} from "@jsonforms/examples/src";
import {getExampleFromUrl, getUrl} from "./lib";
import {vanillaRenderers} from "@jsonforms/vue-vanilla";
import {boplusVueVanillaRenderers} from "../src/index";

const url = computed(() => getUrl());
const examples = computed(() => getExamples().sort((a, b) => a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1));
const example = ref(getExampleFromUrl());


const {schema, uischema} = useJsonforms();
const jsonFormsSchema = schema;
const jsonFormsUiSchema = uischema;
const jsonFormsData = ref({});
const jsonFormsUpdated = ref({});

const jsonFormRenderes = Object.freeze([
  ...vanillaRenderers,
  ...boplusVueVanillaRenderers,
  htmlRenderer,
]);


const jsonForms = computed(() => {
  const exampleData = getExamples().find(item => item.name === example.value);

  if (!exampleData?.uischema) {
    exampleData.uischema = generateDefaultUISchema(exampleData.schema)
  }

  return exampleData
});

const jsonFormRenderesMore = Object.freeze([
  ...jsonFormRenderes,
  htmlRenderer,
]);

const ajv = createAjv();//is needed because reactive :schema & :uischema will throw error
watch(() => example.value, async () => {
  window.location.hash = example.value ? "/jsonforms?example="+example.value : '';
})
</script>

