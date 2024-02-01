<template>

  <div class="formBuilderDetails flex flex-col-reverse gap-4">

    <details>
      <summary class="cursor-pointer">JSON</summary>
      <div class="card p-4">
        <SchemaCode
            v-model:schema="jfResolved.schema"
            v-model:uischema="jfResolved.uischema"
        />
        <!--
        :TODO emit event to send updated schema
            @update:schema="updateEditor()"
            @update:uischema="updateEditor()"
           --->
      </div>
    </details>

    <details v-if="false !== jfResolved?.uischema">
      <summary class="cursor-pointer">JsonForms Preview</summary>
      <ResizeArea>
        <div class="card p-4 styleA" style="min-height: 106px">

            <JsonForms
                :schema="jfResolved.schema"
                :uischema="jfResolved.uischema"
                :data="jfResolved.data"
                :renderers="renderers"
                v-if="jfResolved?.schema"
                :key="newKey"
            />
            <!--
                :i18n="{translate: createI18nTranslate(localeCatalogue)}"
                :ajv="ajv"
                validation-mode="NoValidation"
            -->

        </div>
      </ResizeArea>

      <details open="true" class="pt-4">
        <summary class="cursor-pointer">Data</summary>
        <div class="styleA flex gap-4">
          <textarea class="h-60 p-4" readonly disabled>{{ jfResolved?.data }}</textarea>
          <textarea class="h-60 p-4 text-red-600" readonly disabled>{{ jfResolved?.errors }}</textarea>
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
import boplusVueVanillaRenderers from "@backoffice-plus/jsonforms-vue-vanilla";
import {formbuilderRenderers} from "../src/components/renderers";

const props = defineProps({
  jsonForms: Object, //read from store
})

const jfResolved = ref({});
const newKey = ref({});

jfResolved.value = {
  schema:props.jsonForms?.schema,
  uischema:props.jsonForms?.uischema,
}

const renderers = Object.freeze([
  ...vanillaRenderers,
  ...boplusVueVanillaRenderers,
  ...formbuilderRenderers,
]);

const setJfProps = () => {
  const isArray = 'array' === props.jsonForms?.schema?.type;

  jfResolved.value = {
    schema: props.jsonForms?.schema,
    uischema: props.jsonForms?.uischema,
    data: props.jsonForms?.data ?? (isArray ? [] : {}),
  };

  newKey.value = Math.random()
}

setJfProps();

watch(() => props.jsonForms, setJfProps)


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

