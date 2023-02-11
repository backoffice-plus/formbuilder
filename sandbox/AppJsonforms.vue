<template>

  <div class="container max-w-screen-lg mx-auto p-4 flex flex-col gap-4">

    <div class="flex items-baseline gap-2"><h2>{{ example }}</h2> <a :href="'#/'+ url.search" class=" text-sm">[back]</a></div>


    <details open="true">
      <summary class="cursor-pointer">JsonForms</summary>
      <div class="card p-4">
        <JsonForms
            :class="'styleA'"
            :schema="jsonForms.schema"
            :uischema="jsonForms.uischema"
            :data="jsonFormsData"
            :renderers="jsonFormRenderesMore"
            :ajv="ajv"
        />
      </div>
    </details>

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
import {computed, ref} from 'vue'
import {JsonForms} from "@jsonforms/vue";
import {createAjv, generateDefaultUISchema} from "@jsonforms/core";
import {jsonFormRenderes} from "../src/index";
import SchemaCode from './SchemaCode.vue'
import {useJsonforms} from "../src/composable/jsonforms";
import {entry as htmlRenderer} from "./tool/htmlRenderer.vue";
import {getExamples} from "@jsonforms/examples/src";
import {getExampleFromUrl, getUrl} from "./lib";

const url = computed(() => getUrl());
const examples = computed(() => getExamples().sort((a, b) => a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1));
const example = ref(getExampleFromUrl());


const {schema, uischema} = useJsonforms();
const jsonFormsSchema = schema;
const jsonFormsUiSchema = uischema;
const jsonFormsData = ref({});
const jsonFormsUpdated = ref({});

const jsonForms = computed(() => {
  const exampleData = getExamples().find(item => {
    return item.label === example.value
  });

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

</script>

