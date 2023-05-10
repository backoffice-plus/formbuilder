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

    <details v-if="false !== jsonFormsUiSchema">
      <summary class="cursor-pointer">JsonForms Preview</summary>
      <ResizeArea>
        <div class="card p-4 styleA" style="min-height: 106px">
          <Suspense>
            <JsonForms
                :schema="jsonFormsSchema"
                :uischema="jsonFormsUiSchema"
                :data="jsonFormsData"
                :renderers="jsonFormRenderesMore"
                :ajv="ajv"
                :i18n="{translate: createI18nTranslate(localeCatalogue)}"
                v-if="jsonFormsSchema && jsonFormsUiSchema"
                :key="newKey"
                @change="r => jsonFormsUpdated=r"
            />
            <template #fallback>
              JsonForms Loading...
            </template>
          </Suspense>
        </div>
      </ResizeArea>

      <details open="true" class="pt-4">
        <summary class="cursor-pointer">Data</summary>
        <div class="styleA flex gap-4">
          <textarea class="h-60 p-4" readonly disabled>{{ jsonFormsUpdated?.data }}</textarea>
          <textarea class="h-60 p-4 text-red-600" readonly disabled>{{ jsonFormsUpdated?.errors }}</textarea>
        </div>
      </details>

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
import {vanillaRenderers} from "@jsonforms/vue-vanilla";
import {createI18nTranslate} from "../src/index";
import SchemaCode from './SchemaCode.vue'
import ResizeArea from "./ResizeArea.vue";
import {translationsErrors as localeCatalogue} from "../src/translations/de";
import {boplusVueVanillaRenderers} from "../src/index";

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

/**
 * @see https://ajv.js.org/options.html#advanced-options
 */
const ajv = createAjv(
    {
      validateSchema: false, //ignore $schema
      addUsedSchema: false, //ignore $id
      //missingRefs : 'ignore',
      //inlineRefs: false,
    }
);//is needed because reactive :schema & :uischema will throw error


/**
 * :TODO find a way to import this $ref schemas from example schemas
 */
// import addressSchema from "./jsonForms/examples/json/address.schema.json";
// import geoSchema from "./jsonForms/examples/json/geographical-location.schema.json";
// //import schema202012 from "./jsonForms/examples/json/schema2020-12.schema.json";
// try {
//   ajv.addMetaSchema(addressSchema)
//   ajv.addMetaSchema(geoSchema)
//   //ajv.addSchema(schema202012)
// }
// catch (e) {
//   console.log("FBD addMetaSchema catch",e);
// }

</script>

