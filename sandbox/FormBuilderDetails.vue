<template>

  <div class="formBuilderDetails flex flex-col-reverse gap-4">

    <details>
      <summary class="cursor-pointer">JSON</summary>
      <div class="card p-4">
        <SchemaCode
            v-model:schema="jsonFormsSchema"
            v-model:uischema="jsonFormsUiSchema"
        />
        <!--
        :TODO emit event to send updated schema
            @update:schema="updateEditor()"
            @update:uischema="updateEditor()"
           --->
      </div>
    </details>

    <details>
      <summary class="cursor-pointer">JsonForms Preview</summary>
      <ResizeArea>
        <div class="card p-4 styleA" style="min-height: 106px">
            <JsonForms
                :schema="jsonFormsSchema"
                :uischema="jsonFormsUiSchema"
                :data="jsonFormsData"
                :renderers="jsonFormRenderesMore"
                :ajv="ajv"
                :i18n="{translate: createI18nTranslate(localeCatalogue)}"
                v-if="jsonFormsSchema"
                :key="newKey"
                @change="r => jsonFormsUpdated=r"
            />
        </div>
      </ResizeArea>

      <template v-if="jsonFormsUpdated?.errors?.length">
        Errors
        <textarea class="outputField text-red-500" readonly disabled>{{ jsonFormsUpdated?.errors }}</textarea>
      </template>

      Data
      <textarea class="outputField" readonly disabled>{{ jsonFormsUpdated?.data }}</textarea>

    </details>

  </div>

</template>

<style>

.outputField {
  @apply
  w-full h-60
  p-4
  bg-transparent
  border border-gray-300/50
  rounded
}

</style>


<script setup>
import {computed, ref, watch} from 'vue'
import { onMounted, onBeforeUnmount } from 'vue'
import {JsonForms} from "@jsonforms/vue";
import {createAjv} from "@jsonforms/core";
import {createI18nTranslate} from "../src/index";
import SchemaCode from './SchemaCode.vue'
import ResizeArea from "./ResizeArea.vue";
import {translationsErrors as localeCatalogue} from "../src/translations/de";
import {vanillaRenderers} from "@jsonforms/vue-vanilla";
import {boplusVueVanillaRenderers} from "../packages/boplus-vue-vanilla/src";

const props = defineProps({
  jsonForms: Object, //read from store
})

const jsonFormsSchema = ref(props.jsonForms.schema);
const jsonFormsUiSchema = ref(props.jsonForms.uischema);
const jsonFormsData = ref({});
const jsonFormsUpdated = ref({});

const newKey = computed(() => JSON.stringify([jsonFormsSchema.value,jsonFormsUiSchema.value]));

const jsonFormRenderesMore = Object.freeze([
  ...vanillaRenderers,
  ...boplusVueVanillaRenderers,
]);

watch(() => props.jsonForms, () => {
   jsonFormsSchema.value = props.jsonForms?.schema;
   jsonFormsUiSchema.value = props.jsonForms?.uischema;
   jsonFormsData.value = props.jsonForms?.data ?? {};
})


onMounted(() => {
  // jsonFormsSchema.value = props.jsonForms?.schema;
  // jsonFormsUiSchema.value = props.jsonForms?.uischema;
  // jsonFormsData.value = props.jsonForms?.data ?? {};

  // emitter.on('formBuilderSchemaUpdated', (jsonForms) => {
  //   jsonFormsSchema.value = jsonForms?.schema;
  //   jsonFormsUiSchema.value = jsonForms?.uischema;
  // });
});
// onBeforeUnmount(() => {
//   emitter.off('formBuilderSchemaUpdated');
// })

const ajv = createAjv();//is needed because reactive :schema & :uischema will throw error

</script>

